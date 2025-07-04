// Types
import type { ITreeNodeMeta } from '../types/tree-node-meta.type'

function getDefaultNodeMeta(): ITreeNodeMeta {
  return {
    level: 0,
    childrenLoaded: false,
    parent: null,
    collapsed: true,
  }
}

export function flattenTreeNodes<T extends IItem = IItem>(
  nodes: ITreeNode<T>[],
  options?: {
    childrenKey?: string
    level?: number
    nodeMetaById?: Record<ITreeNode['id'], ITreeNodeMeta<T>>
    parent?: ITreeNode<T> | null
  },
) {
  const {
    childrenKey = 'children',
    level = 0,
    nodeMetaById = {},
    parent,
  } = options ?? {}

  const _nodes: ITreeNode<T>[] = []

  nodes.forEach(node => {
    // We adjust the meta
    const nodeMeta = nodeMetaById[node.id] ?? getDefaultNodeMeta() as ITreeNodeMeta<T>
    nodeMeta.level = level
    nodeMeta.parent = parent

    nodeMetaById[node.id] = nodeMeta

    // We add the node
    _nodes.push(node)

    const children = get(node, childrenKey) as ITreeNode<T>[]
    if (children) {
      _nodes.push(
        ...flattenTreeNodes(
          children,
          { ...options, level: level + 1, nodeMetaById, parent: node },
        ),
      )
    }
  })

  return _nodes
}

// Types
import type { ITreeNode } from '$utils/shared/types/tree-node.type'
import type { ITreeNodeMeta } from '../types/tree-node-meta.type'

function getDefaultNodeMeta(): ITreeNodeMeta {
  return {
    level: 0,
    childrenLoaded: false,
    parent: null,
    collapsed: true,
  }
}

export function flattenTreeNodes(
  nodes: ITreeNode[],
  options?: {
    childrenKey?: string
    level?: number
    nodeMetaById?: Record<ITreeNode['id'], ITreeNodeMeta>
    parent?: ITreeNode | null
  },
) {
  const {
    childrenKey = 'children',
    level = 0,
    nodeMetaById = {},
    parent,
  } = options ?? {}

  const _nodes: ITreeNode[] = []

  nodes.forEach(node => {
    // We adjust the meta
    const nodeMeta = nodeMetaById[node.id] ?? getDefaultNodeMeta() as ITreeNodeMeta
    nodeMeta.level = level
    nodeMeta.parent = parent

    nodeMetaById[node.id] = nodeMeta

    // We add the node
    _nodes.push(node)

    const children = get(node, childrenKey) as ITreeNode[]
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

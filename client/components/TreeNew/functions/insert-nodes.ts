// Types
import type { ITreeNode } from '../types/tree-node.new.type'
import type { ITreeProps } from '../types/tree-props.new.type'
import type { ITreeNodeMeta } from '../types/tree-node-meta.new.type'

// Functions
import { flattenTreeNodes } from './flatten-tree-nodes.new'
import { createHierarchyFromFlattenedNodes } from './create-hierarchy-from-flattened-nodes'

export async function insertNodes(payload: {
  // Keys
  idKey: string
  childrenKey: string
  labelKey?: string

  // Data
  index: number
  parent?: ITreeNode<IItem> | null
  items: IItem[]
  model: Ref<IItem[]>
  nodesFlattened: Ref<ITreeNode<IItem>[]>
  nodeMetaById: Ref<Record<ITreeNode['id'], ITreeNodeMeta>>

  // Configs
  collapseConfig?: ITreeProps<IItem>['collapseConfig']
  sortingConfig?: ITreeProps<IItem>['sortingConfig']

  // Options
  /**
   * When true, the items hierarchy will be created based on
   * the result and used to update the model. This will trigger
   * the necessary re-renders
   */
  commit?: boolean | 'with-next-tick'
}) {
  const {
    items,
    index,
    nodesFlattened,
    parent,
    commit,
    nodeMetaById,
    childrenKey,
    model,
  } = payload

  const nodes = await flattenTreeNodes({
    ...payload,
    parent,
    nodes: items,
  }) as ITreeNode<IItem>[]

  const newNodes = nodesFlattened.value.toSpliced(index + 1, 0, ...nodes)

  if (commit) {
    if (commit === 'with-next-tick') {
      nextTick(() => {
        model.value = createHierarchyFromFlattenedNodes({
          nodesFlattened: newNodes,
          childrenKey,
          nodeMetaById: nodeMetaById.value,
        })
      })
    } else {
      model.value = createHierarchyFromFlattenedNodes({
        nodesFlattened: newNodes,
        childrenKey,
        nodeMetaById: nodeMetaById.value,
      })
    }
  }

  return { nodes: newNodes, added: nodes }
}

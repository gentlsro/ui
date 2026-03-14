// Types
import type { ITreeNode } from '../types/tree-node.type'
import type { ITreeProps } from '../types/tree-props.type'
import type { ITreeNodeMeta } from '../types/tree-node-meta.type'

// Functions
import { flattenTreeNodes } from './flatten-tree-nodes'
import { createHierarchyFromFlattenedNodes } from './create-hierarchy-from-flattened-nodes'

export async function insertNodes<T extends IItem = IItem>(payload: {
  // Keys
  idKey: string
  childrenKey: string
  labelKey?: string

  // Data
  index: number
  parent?: ITreeNode<T> | null
  items: T[]
  model: Ref<T[]>
  nodesFlattened: Ref<ITreeNode<T>[]>
  nodeMetaById: Ref<Record<ITreeNode['id'], ITreeNodeMeta>>

  // Configs
  collapseConfig?: ITreeProps<T>['collapseConfig']
  sortingConfig?: ITreeProps<T>['sortingConfig']

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

  const nodes = await flattenTreeNodes<T>({
    ...payload,
    parent,
    nodes: items,
  })

  const newNodes = nodesFlattened.value.toSpliced(index + 1, 0, ...nodes)

  if (commit) {
    if (commit === 'with-next-tick') {
      nextTick(() => {
        model.value = createHierarchyFromFlattenedNodes<T>({
          nodesFlattened: newNodes,
          childrenKey,
          nodeMetaById: nodeMetaById.value,
        })
      })
    } else {
      model.value = createHierarchyFromFlattenedNodes<T>({
        nodesFlattened: newNodes,
        childrenKey,
        nodeMetaById: nodeMetaById.value,
      })
    }
  }

  return { nodes: newNodes as ITreeNode<T>[], added: nodes }
}

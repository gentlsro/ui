// Types
import type { ITreeNode } from '../types/tree-node.type'
import type { ITreeNodeMeta } from '../types/tree-node-meta.type'

// Functions
import { insertNodes } from './insert-nodes'

// Store
import type { useTreeStore } from '../stores/tree.store'

export async function toggleNodeCollapse<T extends IItem = IItem>(payload: {
  node: ITreeNode<T>
  getStore: () => ReturnType<typeof useTreeStore<T>>
}) {
  const { node, getStore } = payload
  const {
    nodeMetaById,
    loadChildrenConfig,
    nodesFlattened,
    idKey,
    childrenKey,
    labelKey,
    model,
    collapseConfig,
    sortingConfig,
  } = getStore()

  const nodeMeta = nodeMetaById.value[node.id]

  if (!nodeMeta) {
    return
  }

  // Collapse
  if (!nodeMeta.isCollapsed) {
    nodeMetaById.value[node.id]!.isCollapsed = !nodeMeta.isCollapsed
  }

  // Expand
  else {
    const { fnc } = loadChildrenConfig.value ?? {}
    const hasChildren = nodeMeta.isChildrenLoaded

    // Potentially load children
    if (!hasChildren && fnc) {
      nodeMeta.isLoading = true
      try {
        const children = await fnc(node)

        const items = loadChildrenConfig.value?.payloadKey
          ? get(children, loadChildrenConfig.value?.payloadKey) ?? []
          : (children ?? [])

        await insertNodes<T>({
          items,
          model,
          parent: node,
          index: nodesFlattened.value.findIndex(n => n.id === node.id),
          nodesFlattened,
          idKey: idKey.value,
          childrenKey: childrenKey.value,
          labelKey: labelKey.value,
          collapseConfig: collapseConfig.value,
          sortingConfig: sortingConfig.value,
          nodeMetaById,
          commit: 'with-next-tick',
        })
      } catch {
        nodeMeta.isLoading = false
      } finally {
        nodeMeta.isLoading = false
      }
    }

    nodeMeta.isCollapsed = !nodeMeta.isCollapsed
    nodeMeta.isChildrenLoaded = true
  }
}

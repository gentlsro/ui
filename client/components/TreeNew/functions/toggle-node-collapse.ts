// Types
import type { ITreeNode } from '../types/tree-node.new.type'
import type { ITreeNodeMeta } from '../types/tree-node-meta.new.type'

// Functions
import { insertNodes } from './insert-nodes'

// Store
import type { useTreeStore } from '../stores/tree.store.new'

export async function toggleNodeCollapse(payload: {
  node: ITreeNode<IItem>
  getStore: () => ReturnType<typeof useTreeStore>
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

        await insertNodes({
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

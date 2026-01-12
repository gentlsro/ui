// Types
import type { ITreeNode } from '../types/tree-node.type'
import type { ITreeNodeMeta } from '../types/tree-node-meta.type'

// Functions
import { toggleNodeCollapse } from './toggle-node-collapse'

// Store
import type { useTreeStore } from '../stores/tree.store'

export async function treeExpandAll(payload: {
  getStore: () => ReturnType<typeof useTreeStore>
}) {
  const { getStore } = payload
  const { actionsConfig, nodesFlattened, nodeMetaById } = getStore()
  const { autoLoadChildrenOnExpandAll } = actionsConfig.value ?? {}

  // We want to do this outside of the async loop to prevent rerendering the tree
  // for each change
  const nodeIdsToExpand: ITreeNode['id'][] = []

  for await (const node of nodesFlattened.value) {
    const nodeMeta = nodeMetaById.value[node.id]

    if (!nodeMeta) {
      continue
    }

    // When children are loaded, we just expand the node
    if (nodeMeta.isChildrenLoaded || !autoLoadChildrenOnExpandAll) {
      nodeIdsToExpand.push(node.id)
    }

    // Otherwise, we also load the children
    else if (nodeMeta.isCollapsed) {
      toggleNodeCollapse({ node, getStore })
    }
  }

  nodeIdsToExpand.forEach(nodeId => {
    const nodeMeta = nodeMetaById.value[nodeId]

    if (!nodeMeta) {
      return
    }

    nodeMeta.isCollapsed = false
  })
}

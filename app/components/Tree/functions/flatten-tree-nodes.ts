// Types
import type { ITreeNode } from '../types/tree-node.type'
import type { ITreeProps } from '../types/tree-props.type'
import type { ITreeNodeMeta } from '../types/tree-node-meta.type'

const { sortData } = useSorting()

async function traverseNodes<T extends IItem = IItem>(payload: {
  flattenedNodes?: ITreeNode<T>[]
  nodes: T[]
  childrenKey: string
  idKey: string
  labelKey?: string
  level?: number
  path?: string
  nodeMetaById: Ref<Record<ITreeNode['id'], ITreeNodeMeta>>
  collapseConfig?: ITreeProps<T>['collapseConfig']
  sortingConfig?: ITreeProps<T>['sortingConfig']
}): Promise<ITreeNode<T>[]> {
  const {
    flattenedNodes = [],
    nodes,
    childrenKey,
    idKey,
    labelKey,
    level = 0,
    path,
    nodeMetaById,
    collapseConfig,
    sortingConfig,
  } = payload

  const nodesSorted = sortingConfig?.enabled
    ? await sortData(nodes, sortingConfig.sortBy ?? [])
    : nodes

  for await (const node of nodesSorted) {
    // Get node id using idKey
    const nodeId = get(node, idKey) as string | number

    if (!nodeId) {
      continue // Skip nodes without id
    }

    // Get children
    const children = get(node, childrenKey) as T[] | undefined

    // Determine if node has children using collapseConfig.hasChildrenFnc if available
    const hasChildrenFnc = collapseConfig?.hasChildrenFnc
    let hasChildren: boolean
    let isChildrenLoaded: boolean

    // Use collapseConfig.hasChildrenFnc if available
    if (hasChildrenFnc) {
      hasChildren = hasChildrenFnc(node as T)
      // If function returns false, we know for sure it has no children (loaded)
      if (!hasChildren) {
        isChildrenLoaded = true
      } else {
        // If function returns true, check if children actually exist
        isChildrenLoaded = !!children && children.length > 0
      }
    }

    // Default behavior: check if children exist
    else {
      hasChildren = !!children
      isChildrenLoaded = hasChildren
    }

    // Build the path for this node based on the `idKey`
    const nodePath = path
      ? `${path}.${childrenKey}.${nodeId}`
      : String(nodeId)

    // Get label if labelKey is provided
    const label = labelKey ? get(node, labelKey) as string | number | undefined : nodeId

    // Create ITreeNode from IItem
    const treeNode: ITreeNode<T> = {
      id: nodeId,
      label,
      ref: node,
    }

    // Upsert nodeMetaById
    const isExpanded = level < (collapseConfig?.expandedLevelOnInit ?? 0)

    const existingMeta = nodeMetaById.value[nodeId]
    nodeMetaById.value[nodeId] = {
      level,
      path: nodePath,
      isChildrenLoaded: existingMeta?.isChildrenLoaded ?? isChildrenLoaded,
      isCollapsed: existingMeta?.isCollapsed ?? !isExpanded,
      isLoading: existingMeta?.isLoading ?? false,
    }

    // Add node to flattened array
    flattenedNodes.push(treeNode)

    // Recursively process children if they exist
    if (children && children.length > 0) {
      await traverseNodes({
        flattenedNodes,
        nodes: children,
        childrenKey,
        idKey,
        labelKey,
        level: level + 1,
        path: nodePath,
        nodeMetaById,
        collapseConfig,
        sortingConfig,
      })
    }
  }

  return flattenedNodes
}

export async function flattenTreeNodes<T extends IItem = IItem>(payload: {
  nodes: T[]
  parent?: ITreeNode<T> | null

  // Keys
  childrenKey: string
  idKey: string
  labelKey?: string
  nodeMetaById: Ref<Record<ITreeNode['id'], ITreeNodeMeta>>

  // Configs
  collapseConfig?: ITreeProps<T>['collapseConfig']
  sortingConfig?: ITreeProps<T>['sortingConfig']
}): Promise<ITreeNode<T>[]> {
  const { nodeMetaById, parent } = payload

  const args: Partial<{ level: number, path: string }> = {}
  if (parent) {
    const { level = 0, path } = nodeMetaById.value[parent.id] ?? {}

    args.level = level + 1
    args.path = path
  }

  const _nodes: ITreeNode<T>[] = []
  const flattenedNodes = await traverseNodes({
    ...payload,
    ...args,
    flattenedNodes: _nodes,
  })

  return flattenedNodes
}

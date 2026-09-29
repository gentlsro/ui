// Types
import type { ITreeNode } from '../types/tree-node.type'
import type { ITreeProps } from '../types/tree-props.type'
import type { ITreeNodeMeta } from '../types/tree-node-meta.type'

const { sortData } = useSorting()

// Number of children a node had when it was created, so a reused node never hides a change of its children
const childCountByNode = new WeakMap<ITreeNode, number>()

/**
 * Sorts every children array of the tree up front (sorting is async), so the traversal itself can stay synchronous
 */
async function getSortedNodes<T extends IItem = IItem>(payload: {
  nodes: T[]
  childrenKey: string
  sortingConfig: NonNullable<ITreeProps<T>['sortingConfig']>
  sortedByNodes?: Map<T[], T[]>
}) {
  const { nodes, childrenKey, sortingConfig, sortedByNodes = new Map<T[], T[]>() } = payload
  const nodesSorted = await sortData(nodes, sortingConfig.sortBy ?? []) as T[]

  sortedByNodes.set(nodes, nodesSorted)

  for (const node of nodesSorted) {
    const children = get(node, childrenKey) as T[] | undefined

    if (children?.length) {
      await getSortedNodes({ nodes: children, childrenKey, sortingConfig, sortedByNodes })
    }
  }

  return sortedByNodes
}

function traverseNodes<T extends IItem = IItem>(payload: {
  flattenedNodes: ITreeNode<T>[]
  nodes: T[]
  childrenKey: string
  idKey: string
  labelKey?: string
  level: number
  path?: string
  nodeMetaById: Ref<Record<ITreeNode['id'], ITreeNodeMeta>>
  collapseConfig?: ITreeProps<T>['collapseConfig']
  sortedByNodes?: Map<T[], T[]>
  previousNodeById?: Map<ITreeNode['id'], ITreeNode<T>>
}) {
  const {
    flattenedNodes,
    nodes,
    childrenKey,
    idKey,
    labelKey,
    level,
    path,
    nodeMetaById,
    collapseConfig,
    sortedByNodes,
    previousNodeById,
  } = payload

  const nodesSorted = sortedByNodes?.get(nodes) ?? nodes
  const metaById = nodeMetaById.value
  const metaByIdRaw = toRaw(metaById)
  const hasChildrenFnc = collapseConfig?.hasChildrenFnc
  const isExpanded = level < (collapseConfig?.expandedLevelOnInit ?? 0)

  for (const node of nodesSorted) {
    // Get node id using idKey
    const nodeId = get(node, idKey) as string | number

    if (!nodeId) {
      continue // Skip nodes without id
    }

    // Get children
    const children = get(node, childrenKey) as T[] | undefined
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
    const childCount = children?.length ?? 0

    // Reuse the previous node when nothing it exposes changed, so rows bound to it don't re-render
    const previousNode = previousNodeById?.get(nodeId)
    const canReuse = previousNode
      && previousNode.ref === node
      && previousNode.label === label
      && childCountByNode.get(previousNode) === childCount

    const treeNode: ITreeNode<T> = canReuse ? previousNode : { id: nodeId, label, ref: node }

    if (!canReuse) {
      childCountByNode.set(treeNode, childCount)
    }

    // Upsert nodeMetaById, writing only what changed (every write re-renders the rows that read the meta)
    const existingMeta = metaByIdRaw[nodeId]

    if (!existingMeta) {
      metaById[nodeId] = {
        level,
        path: nodePath,
        isChildrenLoaded,
        isCollapsed: !isExpanded,
        isLoading: false,
      }
    } else {
      const meta = metaById[nodeId]!

      if (existingMeta.level !== level) {
        meta.level = level
      }

      if (existingMeta.path !== nodePath) {
        meta.path = nodePath
      }

      if (existingMeta.isChildrenLoaded === undefined) {
        meta.isChildrenLoaded = isChildrenLoaded
      }

      if (existingMeta.isCollapsed === undefined) {
        meta.isCollapsed = !isExpanded
      }

      if (existingMeta.isLoading === undefined) {
        meta.isLoading = false
      }
    }

    // Add node to flattened array
    flattenedNodes.push(treeNode)

    // Recursively process children if they exist
    if (children && children.length > 0) {
      traverseNodes({
        flattenedNodes,
        nodes: children,
        childrenKey,
        idKey,
        labelKey,
        level: level + 1,
        path: nodePath,
        nodeMetaById,
        collapseConfig,
        sortedByNodes,
        previousNodeById,
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

  /**
   * The nodes of the previous flattening: a node whose item, label and number of children are unchanged is returned
   * as the same object
   */
  previousNodeById?: Map<ITreeNode['id'], ITreeNode<T>>
}): Promise<ITreeNode<T>[]> {
  const { nodeMetaById, parent, nodes, childrenKey, sortingConfig } = payload

  const args: { level: number, path?: string } = { level: 0 }
  if (parent) {
    const { level = 0, path } = nodeMetaById.value[parent.id] ?? {}

    args.level = level + 1
    args.path = path
  }

  const sortedByNodes = sortingConfig?.enabled
    ? await getSortedNodes({ nodes, childrenKey, sortingConfig })
    : undefined

  return traverseNodes({
    ...payload,
    ...args,
    sortedByNodes,
    flattenedNodes: [],
  })
}

// Types
import type { ITreeProps } from '../types/tree-props.new.type'
import type { ITreeNodeMeta } from '../types/tree-node-meta.type'

function traverseNodes<T extends IItem = IItem>(payload: {
  flattenedNodes?: ITreeNode<IItem<T>>[]
  nodes: IItem<T>[]
  childrenKey: string
  parentKey: string
  idKey: string
  labelKey?: string
  level?: number
  path?: string
  treeNodeMetaById: Record<ITreeNode['id'], ITreeNodeMeta>
  collapsingConfig?: ITreeProps<T>['collapsingConfig']
}): ITreeNode<IItem<T>>[] {
  const {
    flattenedNodes = [],
    nodes,
    childrenKey,
    parentKey,
    idKey,
    labelKey,
    level = 0,
    path,
    treeNodeMetaById,
    collapsingConfig,
  } = payload

  nodes.forEach((node, index) => {
    // Get node id using idKey
    const nodeId = get(node, idKey) as string | number

    if (!nodeId) {
      return // Skip nodes without id
    }

    // Get children
    const children = get(node, childrenKey) as IItem<T>[] | undefined

    // Determine if node has children using collapsingConfig.hasChildrenFnc if available
    const hasChildrenFnc = collapsingConfig?.hasChildrenFnc
    let hasChildren: boolean
    let isChildrenLoaded: boolean

    // Use collapsingConfig.hasChildrenFnc if available
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
      hasChildren = !!children && children.length > 0
      isChildrenLoaded = hasChildren
    }

    // Build the path for this node based on the `idKey`
    const nodePath = path
      ? `${path}.${childrenKey}.${nodeId}`
      : String(nodeId)

    // Get label if labelKey is provided
    const label = labelKey ? get(node, labelKey) as string | number | undefined : nodeId

    // Create ITreeNode from IItem
    const treeNode: ITreeNode<IItem<T>> = {
      ...node,
      id: nodeId,
      label,
      ref: node,
    }

    // Upsert treeNodeMetaById
    const existingMeta = treeNodeMetaById[nodeId]
    const nodeMeta: ITreeNodeMeta = {
      level,
      path: nodePath,
      isChildrenLoaded,
      isCollapsed: existingMeta?.isCollapsed ?? true,
      isLoading: existingMeta?.isLoading ?? false,
    }

    treeNodeMetaById[nodeId] = nodeMeta

    // Add node to flattened array
    flattenedNodes.push(treeNode)

    // Recursively process children if they exist
    if (children && children.length > 0) {
      traverseNodes({
        flattenedNodes,
        nodes: children,
        childrenKey,
        parentKey,
        idKey,
        labelKey,
        level: level + 1,
        path: nodePath,
        treeNodeMetaById,
        collapsingConfig,
      })
    }
  })

  return flattenedNodes
}

export function flattenTreeNodes<T extends IItem = IItem>(payload: {
  nodes: IItem<T>[]
  childrenKey: string
  parentKey: string
  idKey: string
  labelKey?: string
  collapsingConfig?: ITreeProps<T>['collapsingConfig']
  treeNodeMetaById: Record<ITreeNode['id'], ITreeNodeMeta>
}): ITreeNode<IItem<T>>[] {
  console.log('Flattening tree nodes...')

  const _nodes: ITreeNode<IItem<T>>[] = []
  const flattenedNodes = traverseNodes({
    ...payload,
    flattenedNodes: _nodes,
  })

  return flattenedNodes
}

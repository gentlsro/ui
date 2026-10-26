// Types
import type { ITreeNode } from '../types/tree-node.type'
import type { ITreeProps } from '../types/tree-props.type'

export function searchNodes<T extends IItem = IItem>(payload: {
  nodesFlattened: ITreeNode<T>[]
  search: string
  idKey?: string
  labelKey?: string
  nodeById?: Record<ITreeNode['id'], ITreeNode<T>>
  ancestorIdsByNodeId?: Record<ITreeNode['id'], ITreeNode['id'][]>
  parentIdByNodeId?: Record<ITreeNode['id'], ITreeNode['id'] | undefined>
  childrenIdsByNodeId?: Record<ITreeNode['id'], ITreeNode['id'][]>
  searchConfig?: ITreeProps<T>['searchConfig']
  searchData: ReturnType<typeof useSearching>['searchDataSync']
}): ITreeNode<T>[] | Promise<ITreeNode<T>[]> {
  const {
    nodesFlattened,
    search,
    idKey = 'id',
    labelKey = 'label',
    nodeById,
    ancestorIdsByNodeId,
    parentIdByNodeId,
    childrenIdsByNodeId,
    searchConfig,
    searchData,
  } = payload

  const includeInSearchConfig = searchConfig?.includeInSearch
  const includeInSearch = typeof includeInSearchConfig === 'boolean'
    ? includeInSearchConfig
    : false

  function shouldIncludeInSearch(node: ITreeNode<T>): boolean {
    if (typeof includeInSearchConfig === 'function') {
      const parentId = parentIdByNodeId?.[node.id]
      const parent = !isNil(parentId) ? nodeById?.[parentId]?.ref : undefined
      const childrenIds = childrenIdsByNodeId?.[node.id] ?? []

      const children = childrenIds
        .map(childId => nodeById?.[childId]?.ref)
        .filter(Boolean) as T[]

      return includeInSearchConfig({
        item: node.ref,
        children,
        parent,
      })
    }

    if (includeInSearch) {
      return true
    }

    const hasChildren = !!childrenIdsByNodeId?.[node.id]?.length

    return !hasChildren
  }

  const useCustomSearch = typeof searchConfig?.fnc === 'function'

  if (!search && !useCustomSearch) {
    return nodesFlattened
  }

  const nodesSearchCandidates = nodesFlattened.filter(shouldIncludeInSearch)

  // Filter nodes
  const result = searchConfig?.fnc
    ? searchConfig.fnc(search, nodesSearchCandidates)
    : searchData({
        searchRef: search,
        rowsRef: nodesSearchCandidates,
        fuseOptions: {
          keys: [`ref.${labelKey}`],
          useExtendedSearch: true,
          ...searchConfig?.fuseOptions,
        },
      }).map(res => res.item)

  return Array.isArray(result) ? includeParents(result) : result.then(includeParents)

  function includeParents(nodes: ITreeNode<T>[]) {
    // Enforce includeInSearch even for custom search functions.
    let nodesFiltered = nodes.filter(shouldIncludeInSearch)

    if (!searchConfig?.keepParents) {
      return nodesFiltered
    }

    const visibleNodeIds = new Set(nodesFiltered.map(node => node.id))

    for (const node of nodesFiltered) {
      const ancestorIds = ancestorIdsByNodeId?.[node.id] ?? []

      for (const ancestorId of ancestorIds) {
        visibleNodeIds.add(ancestorId)
      }
    }
    nodesFiltered = nodesFlattened.filter(node => visibleNodeIds.has(node.id))

    // Keep the same array when no nodes were filtered out.
    return nodesFiltered.length === nodesFlattened.length ? nodesFlattened : nodesFiltered
  }
}

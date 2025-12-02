import { useSearching } from '$utils'

// Types
import type { ITreeProps } from '../types/tree-props.type'

// Utils
const { searchData } = useSearching()

export async function searchNodes(payload: {
  nodesFlattened: ITreeNode<IItem>[]
  search: string
  idKey?: string
  labelKey?: string
  searchConfig?: ITreeProps['searchConfig']
  collapsingConfig?: ITreeProps['collapsingConfig']
}): Promise<ITreeNode<IItem>[]> {
  const {
    nodesFlattened,
    search,
    idKey = 'id',
    labelKey = 'label',
    searchConfig,
    collapsingConfig = { showCollapsedWhenSearched: true },
  } = payload

  // Filter nodes
  let nodesFiltered: ITreeNode<IItem>[] = []

  if (searchConfig?.fnc) {
    nodesFiltered = await searchConfig.fnc(search, nodesFlattened) as ITreeNode<IItem>[]
  } else {
    const fuseResult = await searchData({
      searchRef: search,
      rowsRef: nodesFlattened,
      fuseOptions: {
        keys: [idKey, labelKey],
        useExtendedSearch: true,
        ...searchConfig?.fuseOptions,
      },
    })

    nodesFiltered = fuseResult.map(res => res.item) as ITreeNode<IItem>[]
  }

  // TODO: Implement the `showCollapsedWhenSearched` logic

  return nodesFiltered
}

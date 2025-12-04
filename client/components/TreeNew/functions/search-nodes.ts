import { useSearching } from '$utils'

// Types
import type { ITreeNode } from '../types/tree-node.new.type'
import type { ITreeProps } from '../types/tree-props.new.type'

// Utils
const { searchData } = useSearching()

export async function searchNodes(payload: {
  nodesFlattened: ITreeNode<IItem>[]
  search: string
  idKey?: string
  labelKey?: string
  searchConfig?: ITreeProps['searchConfig']
  collapseConfig?: ITreeProps['collapseConfig']
}): Promise<ITreeNode<IItem>[]> {
  const {
    nodesFlattened,
    search,
    idKey = 'id',
    labelKey = 'label',
    searchConfig,
    collapseConfig = { showCollapsedWhenSearched: true },
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

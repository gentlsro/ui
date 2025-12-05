import { useSearching } from '$utils'

// Types
import type { ITreeNode } from '../types/tree-node.new.type'
import type { ITreeProps } from '../types/tree-props.new.type'

// Utils
const { searchData } = useSearching()

export async function searchNodes<T extends IItem = IItem>(payload: {
  nodesFlattened: ITreeNode<T>[]
  search: string
  idKey?: string
  labelKey?: string
  searchConfig?: ITreeProps<T>['searchConfig']
  collapseConfig?: ITreeProps<T>['collapseConfig']
}): Promise<ITreeNode<T>[]> {
  const {
    nodesFlattened,
    search,
    idKey = 'id',
    labelKey = 'label',
    searchConfig,
    collapseConfig = { showCollapsedWhenSearched: true },
  } = payload

  // Filter nodes
  let nodesFiltered: ITreeNode<T>[] = []

  if (searchConfig?.fnc) {
    nodesFiltered = await searchConfig.fnc(search, nodesFlattened) as ITreeNode<T>[]
  } else {
    const fuseResult = await searchData({
      searchRef: search,
      rowsRef: nodesFlattened,
      fuseOptions: {
        keys: [`ref.${idKey}`, `ref.${labelKey}`],
        useExtendedSearch: true,
        ...searchConfig?.fuseOptions,
      },
    })

    nodesFiltered = fuseResult.map(res => res.item) as ITreeNode<T>[]
  }

  // TODO: Implement the `showCollapsedWhenSearched` logic

  return nodesFiltered
}

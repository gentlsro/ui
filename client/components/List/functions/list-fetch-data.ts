import type { IGroupRow } from '$utilsLayer/shared/composables/useGrouping'

// Types
import type { IListItem } from '../types/list-item.type'
import type { IListProps } from '../types/list-props.type'

export async function listFetchData(payload: {
  search?: string
  handleRequest: ReturnType<typeof useRequest>['handleRequest']
  loadData: IListProps['loadData']
  lastVisibleRow?: IListItem
  isFetchMore?: boolean
  hasMore?: boolean
  listItems?: Array<IListItem | IGroupRow>
  items: IItem[]
}) {
  const {
    search,
    loadData,
    items,
    listItems = [],
    handleRequest,
    isFetchMore,
    hasMore,
  } = payload

  const { fnc, countKey, payloadKey } = loadData ?? {}

  if (!fnc) {
    return {
      hasMore: false,
      items,
    }
  }

  const lastRow = listItems.at(-1) as IListItem
  const res = await handleRequest<IItem>(abortController => {
    return fnc!({
      abortController: abortController(),
      search,
      options: {
        lastRow,
        hasMore,
        listItems,
        items,
        fetchMore: isFetchMore,
      },
    })
  }, { noResolve: true })

  console.log(payloadKey, countKey, res)
  let _items = payloadKey ? get(res, payloadKey) : res
  const _count = countKey ? get(res, countKey) : _items.length

  if (isFetchMore) {
    _items = [...items, ..._items]
  }

  return {
    hasMore: _count > _items.length,
    items: _items,
  }
}

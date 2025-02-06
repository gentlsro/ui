import type { IGroupRow } from '$utilsLayer/shared/composables/useGrouping'

// Types
import type { IListItem } from '../types/list-item.type'
import type { IListProps } from '../types/list-props.type'

// Store
import type { useListStore } from '../stores/list.store'

export async function listFetchData(payload: {
  search?: string
  handleRequest: ReturnType<typeof useRequest>['handleRequest']
  loadData: IListProps['loadData']
  lastVisibleRow?: IListItem
  isFetchMore?: boolean
  hasMore?: boolean
  listItems?: Array<IListItem | IGroupRow>
  items: IItem[]
  modifiers?: IListProps['modifiers']
}) {
  const {
    search,
    loadData,
    items,
    listItems = [],
    handleRequest,
    isFetchMore,
    hasMore,
    modifiers,
  } = payload

  const { fnc, countKey, payloadKey } = loadData ?? {}
  const { onFetchData } = modifiers ?? {}

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

  let _items = payloadKey ? get(res, payloadKey) : res
  const _count = countKey ? get(res, countKey) : _items.length

  if (onFetchData) {
    return onFetchData({
      isFetchMore,
      items: _items,
      count: _count,
      res,
      hasMore,
    })
  }

  if (isFetchMore) {
    _items = [...items, ..._items]
  }

  return {
    hasMore: _count > _items.length,
    items: _items,
  }
}

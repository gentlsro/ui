import type { IGroupRow } from '#layers/utilities/shared/composables/useGrouping'

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
  totalRows?: number
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
    totalRows = 0,
  } = payload

  const { fnc, countKey, payloadKey } = loadData ?? {}
  const { onFetchData } = modifiers ?? {}

  if (!fnc) {
    return {
      hasMore: false,
      items,
    }
  }

  // Get last row
  const lastRow = listItems.toReversed().find(item => {
    if ('isGroup' in item) {
      return false
    }

    const isNew = '_isNew' in item
      || '_isCreate' in item
      || '_isNew' in item.ref
      || '_isCreate' in item.ref

    return !isNew
  })
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
      items,
      itemsFetched: _items,
      count: _count,
      totalRows,
      res,
    })
  }

  if (isFetchMore) {
    _items = [...items, ..._items]
  }

  return {
    hasMore: totalRows > _items.length,
    items: _items,
    totalRows: _count,
  }
}

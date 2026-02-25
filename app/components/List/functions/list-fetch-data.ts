// Types
import type { IListItem } from '../types/list-item.type'
import type { IListProps } from '../types/list-props.type'
import type { UseFnPayload } from '#layers/utilities/app/types/use-fn-payload.type'

// Store
import type { useListStore } from '../stores/list.store'

export async function listFetchData(payload: {
  search?: string
  fn: (fnc: AsyncFunction<any>) => Promise<any>
  loadData: IListProps['loadData']
  lastVisibleRow?: IListItem
  isFetchMore?: boolean
  hasMore?: boolean
  listItems?: Array<IListItem | IGroupRow>
  items: IItem[]
  modifiers?: IListProps['modifiers']
  totalRows?: number
  emits?: IListEmitFncs
}) {
  const {
    search,
    loadData,
    items,
    listItems = [],
    fn,
    isFetchMore,
    hasMore,
    modifiers,
    totalRows = 0,
    emits,
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
  const res = await fn(async abortController => {
    return fnc({
      abortController: abortController(),
      search,
      options: {
        lastRow: lastRow as unknown as IListItem,
        hasMore,
        listItems,
        items,
        fetchMore: isFetchMore,
      },
    })
  })

  let _items = (payloadKey ? get(res, payloadKey) : res) as any[]
  let _count = _items.length
  const hasCount = countKey && !isNil(get(res, countKey))

  if (hasCount) {
    _count = get(res, countKey)
  } else if (totalRows) {
    _count = totalRows
  }

  emits?.fetchData({
    itemsFetched: _items,
    hasMore: _count > _items.length,
    isFetchMore,
    currentItems: items,
    totalRows: _count,
  })

  if (onFetchData) {
    return onFetchData({
      isFetchMore,
      items,
      itemsFetched: _items,
      count: _count,
      totalRows: _count,
      res,
    })
  }

  if (isFetchMore) {
    _items = [...items, ..._items]
  }

  return {
    hasMore: _count > _items.length,
    items: _items,
    totalRows: _count,
  }
}

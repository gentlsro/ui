// Types
import type { FuseResult } from 'fuse.js'
import type { IListItem } from '../types/list-item.type'
import type { IListProps } from '../types/list-props.type'

// Functions
import { getListItemKey, getListItemLabel } from './helpers'
import { highlight } from '#layers/utilities/app/functions/highlightText'

type ListItemsPayload = {
  itemKey?: string
  itemLabel?: IListProps['itemLabel']
  items: IItem[]
  search?: string
  noFilter?: boolean
  fuseOptions: IFuseOptions
  useWorker?: boolean
  groupBy?: GroupItem[]
  sortBy: SortItem[]
  searchConfig?: IListProps['searchConfig']
  sortingConfig?: IListProps['sortingConfig']
  addedItemById: Record<string, IListItemToAdd>
}

/** Capture Nuxt services during setup; built-in transforms stay synchronous. */
export function useListItemsTransformer() {
  const { groupData } = useGrouping()
  const { searchDataSync } = useSearching()
  const { sortDataSync } = useSorting()

  return function transformListItems(payload: ListItemsPayload) {
    const {
      itemKey = 'id',
      itemLabel = 'label',
      items,
      search,
      noFilter,
      fuseOptions,
      useWorker,
      groupBy,
      sortBy,
      searchConfig,
      sortingConfig,
      addedItemById,
    } = payload

    const _extra = { hasExactMatch: false }
    let itemsSearched = toValue(items) as IItem[] | FuseResult<IItem>[]
    const isFuseResult = !searchConfig?.fnc && searchConfig?.enabled && !noFilter

    // Search
    if (searchConfig?.enabled && !noFilter) {
      const searched = searchConfig.fnc
        ? searchConfig.fnc(search, items, _extra)
        : searchDataSync({
            useWorker,
            fuseOptions,
            searchRef: search,
            rowsRef: items,
            normalizeFnc: searchConfig.normalizeFnc,
            fuseSearchToken: searchConfig.fuseSearchToken,
            _extra,
          })
      if (!Array.isArray(searched)) {
        return searched.then(finish)
      }
      itemsSearched = searched
    } else {
      _extra.hasExactMatch = items.some(item => {
        return getListItemLabel(item, itemLabel) === search
      })
    }

    return finish(itemsSearched)

    function finish(itemsSearched: IItem[] | FuseResult<IItem>[]) {
      let _items: Array<IListItem | IGroupRow> = []

      // FIXME: Currently broken
      // Highlighting
      // We only highlight when we have less than 100 items (performance)
      const isHighlighted = searchConfig?.highlight
        && _items.length <= 100
        && !!search
        && isFuseResult
        && false // NOTE: Remove once fixed

      if (isHighlighted) {
        const { highlightedResult } = highlight(
          itemsSearched as FuseResult<IItem>[],
          {
            keys: fuseOptions.keys,
            searchValue: search,
            itemGetter: item => item.item,
          },
        )

        _items = highlightedResult.map((item, idx) => {
          return {
            ref: item.item,
            id: getListItemKey(item.item, itemKey),
            label: getListItemLabel(item.item, itemLabel),
            _highlighted: item.highlighted,
            index: idx, // Just prepare for later
            path: '', // Just prepare for later
            _isCreate: !!addedItemById[getListItemKey(item.item, itemKey)],
          }
        })
      }

      // Otherwise, we just return the items
      else {
        _items = itemsSearched.map((item, idx) => {
          const row = (isFuseResult ? item.item : item) as IItem
          const label = getListItemLabel(row, itemLabel)

          return {
            ref: row,
            id: getListItemKey(row, itemKey),
            label,
            _highlighted: label,
            index: idx, // Just prepare for later
            path: '', // Just prepare for later
            _isCreate: !!addedItemById[getListItemKey(item.item, itemKey)],
          }
        }) as IListItem[]
      }

      // Sorting
      const shouldNotSort = !sortingConfig?.enabled
        || (isFuseResult && fuseOptions.shouldSort)

      const shouldSort = !shouldNotSort

      if (shouldSort) {
        _items = sortDataSync({ rowsRef: _items, columnsRef: sortBy, groupsRef: groupBy })
      }

      // Grouping
      if (groupBy?.length) {
        _items = groupData(
          _items,
          groupBy,
          { useWorker },
        )
      }

      return {
        hasExactMatch: _extra?.hasExactMatch,
        items: _items.map((item, idx) => {
          if (!('isGroup' in item)) {
            item.path = String(idx)
            item.index = idx
          }

          return item
        }),
      }
    }
  }
}

/** Preserve the asynchronous API used by existing helper consumers. */
export async function buildListItems(payload: ListItemsPayload) {
  return useListItemsTransformer()(payload)
}

import type { Required } from 'utility-types'
import type { FuseOptions } from '@vueuse/integrations/useFuse.mjs'
import { useSearching, useSorting } from '$utils'
import type { GroupItem, SortItem } from '$utils'
import { useGrouping } from '#layers/utilities/shared/composables/useGrouping'
import type { IGroupRow } from '#layers/utilities/shared/composables/useGrouping'

// Types
import type { FuseResult } from 'fuse.js'
import type { IListItem } from '../types/list-item.type'
import type { IListProps } from '../types/list-props.type'

// Functions
import { getListItemKey, getListItemLabel } from './helpers'
import { highlight } from '#layers/utilities/shared/functions/highlightText'

const { groupData } = useGrouping()
const { searchData } = useSearching()
const { sortData } = useSorting()

export async function buildListItems(payload: {
  itemKey?: string
  itemLabel?: IListProps['itemLabel']
  items: IItem[]
  search?: string
  noFilter?: boolean
  fuseOptions: Required<FuseOptions<any>, 'keys'>
  useWorker?: boolean
  groupBy?: GroupItem[]
  sortBy: SortItem[]
  searchConfig?: IListProps['searchConfig']
  sortingConfig?: IListProps['sortingConfig']
}) {
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
  } = payload

  const _extra = { hasExactMatch: false }
  let itemsSearched = toValue(items) as IItem[] | FuseResult<IItem>[]
  const isFuseResult = !searchConfig?.fnc && searchConfig?.enabled && !noFilter

  // Search
  if (searchConfig?.enabled && !noFilter) {
    itemsSearched = searchConfig.fnc
      ? await searchConfig.fnc(search, items, _extra)
      : await searchData({
        useWorker,
        fuseOptions,
        searchRef: search,
        rowsRef: items,
        normalizeFnc: searchConfig.normalizeFnc,
        fuseSearchToken: searchConfig.fuseSearchToken,
        _extra,
      })
  }

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
      }
    }) as IListItem[]
  }

  // Sorting
  const shouldNotSort = !sortingConfig?.enabled
    || (isFuseResult && fuseOptions.shouldSort)

  const shouldSort = !shouldNotSort

  if (shouldSort) {
    _items = await sortData(
      _items,
      sortBy,
      groupBy,
      useWorker,
    )
  }

  // Grouping
  if (groupBy?.length) {
    _items = await groupData(
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

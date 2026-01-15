import { ZodType } from 'zod'
import type { Required } from 'utility-types'
import type { GroupItem, SortItem } from '$utils'

// Types
import type { IListItem } from '../types/list-item.type'
import type { IListProps } from '../types/list-props.type'
import type { FuseOptions } from '@vueuse/integrations/useFuse'
import type { IListEmitFncs } from '../types/list-emit-fncs.type'
import type { IListDragMeta } from '../types/list-drag-meta.type'
import type { IListItemToAdd } from '../types/list-item-to-add.type'

// Functions
import { getListItemKey } from '../functions/helpers'
import { listFetchData } from '../functions/list-fetch-data'
import { buildListItems } from '../functions/build-list-items'
import { listItemSelect } from '../functions/list-item-select'
import { listHandleAddSearch } from '../functions/list-handle-add-search'
import { isListItemSelected } from '../functions/helpers/is-list-item-selected'
import { getListDefaultSortBy } from '../functions/helpers/get-list-default-sort-by'

// Components
import type SearchInput from '../../Inputs/TextInput/SearchInput.vue'
import type { Type } from 'arktype'
import { type } from 'arktype'

export const LIST_ID_KEY = Symbol('__listId')

type IConfig = {
  listProps?: IListProps
  injectionKey?: string
}

function createStore(injectionKey?: string) {
  const injectionState = createInjectionState((payload?: IConfig) => {
    const { listProps } = payload ?? {}
    const instance = getCurrentInstance()

    // Store
    const { lastPointerDownType } = storeToRefs(useUIStore())

    // Configs
    const ui = ref(listProps?.ui) as Ref<IListProps['ui']>
    const modifiers = ref(listProps?.modifiers) as Ref<IListProps['modifiers']>
    const loadData = ref(listProps?.loadData) as Ref<IListProps['loadData']>
    const sortingConfig = ref(listProps?.sortingConfig) as Ref<IListProps['sortingConfig']>
    const selectionConfig = ref(listProps?.selectionConfig) as Ref<IListProps['selectionConfig']>
    const searchConfig = ref(listProps?.searchConfig) as Ref<IListProps['searchConfig']>
    const groupBySource = ref(listProps?.groupBy ?? []) as Ref<NonNullable<IListProps['groupBy']>>
    const addConfig = ref(listProps?.addConfig) as Ref<IListProps['addConfig']>

    // Utils
    const { isLoading: isRequestLoading, handleRequest, abortController } = useRequest()
    const refreshTrigger = ref(0)

    const isLoadingSource = initRef({
      propName: 'loading',
      instance,
      props: listProps,
      defaultValue: false,
    })

    const itemKey = initRef({
      propName: 'itemKey',
      instance,
      props: listProps,
      defaultValue: 'id',
    }) as Ref<string>

    const itemLabel = initRef({
      propName: 'itemLabel',
      instance,
      props: listProps,
      defaultValue: 'label',
    }) as Ref<string>

    const isLoading = computed(() => {
      return isRequestLoading.value || isLoadingSource.value
    })

    // Layout
    const listEl = ref<any>() // Instance of VirtualScroller (~ type is broken somehow...)
    const isMounted = ref(false)
    const containerEl = ref<HTMLDivElement>()
    const rowComponent = shallowRef(listProps?.rowComponent ?? 'div')

    const { focused: isFocusedWithin } = useFocusWithin(containerEl)

    const isClearable = initRef({
      propName: 'clearable',
      instance,
      props: listProps,
      defaultValue: false,
    }) as Ref<boolean>

    const noFilter = initRef({
      propName: 'noFilter',
      instance,
      props: listProps,
      defaultValue: false,
    }) as Ref<boolean>

    // Search
    const hasExactMatch = ref(false)
    const searchEl = ref<InstanceType<typeof SearchInput>>()

    const search = initRef({
      propName: 'search',
      instance,
      props: listProps,
      defaultValue: undefined,
    }) as Ref<string | undefined>

    const fuseOptions = ref<Required<FuseOptions<any>, 'keys'>>({
      minMatchCharLength: 1,
      threshold: 0.4,
      isCaseSensitive: false,
      includeMatches: true,
      includeScore: true,
      useExtendedSearch: true,
      keys: [itemLabel.value],

      ...listProps?.searchConfig?.fuseOptions,
    })

    // Grouping
    const groupBy = computed<GroupItem<any>[]>(() => {
      return groupBySource.value.map(g => ({
        ...g,
        format: ({ ref }) => g.format?.(ref) || get(ref, g.field),
      }))
    })

    // Sorting
    // Make sure to have at least one sortBy item
    if (sortingConfig.value && !sortingConfig.value.sortBy?.length) {
      const defaultSortBy = getListDefaultSortBy(itemLabel.value)
      sortingConfig.value.sortBy = defaultSortBy
    }

    const sortBy = computed<SortItem<any>[]>(() => {
      return (sortingConfig.value?.sortBy ?? []).map(s => ({
        ...s,
        format: ({ ref }) => s.format?.(ref) || get(ref, s.field),
      })) ?? []
    })

    // Adding
    const preAddedItem = ref() as Ref<IListItemToAdd>

    const addedItems = initRef({
      propName: 'addedItems',
      instance,
      props: listProps,
      defaultValue: [],
    }) as Ref<IListItemToAdd[]>

    const addedItemById = computed(() => {
      return addedItems.value.reduce((agg, item) => {
        agg[item.id] = item

        return agg
      }, {} as Record<string, IListItemToAdd>)
    })

    // Add validation
    const schema = addConfig.value?.validationSchema as NonNullable<IListProps['addConfig']>['validationSchema'] as Type<any>

    const { $v } = useArk({
      state: () => ({ search: search.value }),
      schema: type({
        search: schema ?? 'unknown.any',
      }),
      scope: '_listAdd',
    })

    // Items
    const items = ref(listProps?.items ?? []) as Ref<any[]>
    const itemsGrouped = ref() as Ref<Array<IListItem | IGroupRow>>
    const useWorker = computed(() => listProps?.useWorker ?? items.value.length > 5e3)

    const hiddenItems = initRef({
      propName: 'hiddenItems',
      instance,
      props: listProps,
      defaultValue: undefined,
    }) as Ref<IListProps['hiddenItems']>

    const itemByKey = computed(() => {
      const allItems = [...items.value, ...addedItems.value.map(item => item.ref)]

      return allItems.reduce((agg, item) => {
        const _itemKey = getListItemKey(item, itemKey.value)
        agg[_itemKey] = item

        return agg
      }, {} as Record<string, any>)
    })

    const isHiddenByItemKey = computed(() => {
      return hiddenItems.value?.reduce<Record<string, boolean>>((agg, item) => {
        const _itemKey = getListItemKey(item, itemKey.value)
        agg[_itemKey] = true

        return agg
      }, {} as Record<string, boolean>) ?? {}
    })

    const listItems = computed(() => {
      return [
        ...(preAddedItem.value ? [preAddedItem.value] : []),
        ...itemsGrouped.value ?? [],
      ]
    })

    watch(search, searchVal => {
      // Check if the search value is below the minimum number of characters
      const minChars = searchConfig.value?.minChars ?? 0
      const _searchVal = (searchVal ?? '')?.trim()

      if (_searchVal?.length < minChars) {
        return
      }

      // Debounce the search to fetch data
      if (typeof loadData.value?.onSearch === 'number') {
        debouncedFetchAndSetData({ isFetchMore: false, force: true })
      }

      // Immediately fetch data
      else if (loadData.value?.onSearch) {
        fetchAndSetData({ isFetchMore: false, force: true })
      }

      // Trigger reactivity for `items` to filter locally and trigger the adding functionality
      if (!searchConfig.value?.syncWithLoad) {
        items.value = [...items.value]
      }
    })

    watchDebounced(
      ([items, addedItems, isHiddenByItemKey, refreshTrigger]),
      async ([items, addedItems]) => {
        const _items = [...items, ...addedItems.map(item => item.ref)]
          .filter(item => !isHiddenByItemKey.value[getListItemKey(item, itemKey.value)])

        const res = await buildListItems({
          items: _items,
          itemKey: itemKey.value,
          itemLabel: itemLabel.value,
          fuseOptions: fuseOptions.value,
          groupBy: groupBy.value,
          noFilter: noFilter.value,
          search: search.value,
          searchConfig: searchConfig.value,
          sortBy: sortBy.value,
          sortingConfig: sortingConfig.value,
          useWorker: useWorker.value,
        })

        hasExactMatch.value = res.hasExactMatch

        listHandleAddSearch({
          preAddedItem, // This ref can/will be mutated
          addConfig: addConfig.value,
          hasExactMatch: hasExactMatch.value,
          search: search.value,
          itemLabel: itemLabel.value,
          validation: $v,
        })

        itemsGrouped.value = res.items

        // Prefocus first item non-group item if out of bounds or
        const isNothingFocused = itemFocusedIdx.value === -1
        const isOutOfBounds = itemFocusedIdx.value > listItems.value.length - 1
        const isGroupFocused = 'isGroup' in (listItems.value[itemFocusedIdx.value] ?? {})

        if (isFocusedWithin.value && (isNothingFocused || isOutOfBounds || isGroupFocused)) {
          const firstNonGroupItemIndex = listItems.value.findIndex(item => !('isGroup' in item))
          itemFocusedIdx.value = firstNonGroupItemIndex
        }
      },
      { debounce: () => isMounted.value ? 10 : 0 }, // To prevent double-trigger when adding items
    )

    // Selection
    const selection = initRef({
      propName: 'selection',
      instance,
      props: listProps,
      defaultValue: undefined,
    }) as Ref<IListProps['selection']>

    function handleSelect(item?: IListItem | IListItemToAdd) {
      if (!item || !selectionConfig.value?.enabled) {
        return
      }

      listItemSelect({
        selection,
        item,
        itemByKey: itemByKey.value,
        selectionConfig: selectionConfig.value,
        isSelected: isListItemSelected({
          item,
          selection: selection.value,
          itemKey: itemKey.value,
        }),
        itemKey: itemKey.value,
        addedItems,
        addConfig: addConfig.value,
        emits: emits.value,
        searchInput: searchEl.value,
        isAddedItem: !!addedItemById.value[item.id],
        clearable: isClearable.value,
        shouldFocusSearch: lastPointerDownType.value === 'mouse',
        validation: $v,
      })
    }

    // Data fetching
    const isFirstFetch = ref(true)
    const hasMore = ref(false)
    const isFetchMore = ref(false)
    const totalRows = ref(0)

    async function fetchData(payload?: {
      isFetchMore?: boolean
      lastVisibleItem?: IListItem

      /**
       * Force will make sure the data will get fetched, even if we have ongoing loading
       * It will also cancel the previous request if any
       */
      force?: boolean
    }) {
      const shouldFetch = !payload?.isFetchMore
        || (payload.isFetchMore && hasMore.value)

      if (!payload?.force && (isLoading.value || !shouldFetch)) {
        return
      }

      abortController.value?.abort()

      return listFetchData({
        search: search.value,
        handleRequest,
        loadData: loadData.value,
        lastVisibleRow: listItems.value.at(-1) as any,
        hasMore: hasMore.value,
        listItems: listItems.value,
        items: items.value,
        modifiers: modifiers.value,
        totalRows: totalRows.value,
        ...payload,
      })
    }

    async function fetchAndSetData(payload?: {
      isFetchMore?: boolean
      lastVisibleItem?: IListItem
      force?: boolean
    }) {
      isFetchMore.value = hasMore.value && !!payload?.isFetchMore
      const res = await fetchData(payload)
      totalRows.value = res?.totalRows ?? 0

      if (!res) {
        return
      }

      hasMore.value = res?.hasMore
      items.value = res.items ? [...res.items] : []
    }

    const debouncedFetchAndSetData = useDebounceFn(
      fetchAndSetData,
      typeof loadData.value?.onSearch === 'number' ? loadData.value?.onSearch : 0,
    )

    // Focusing
    const itemFocusedIdx = ref(-1)

    const itemFocused = computed(() => {
      if (itemFocusedIdx.value > -1) {
        return listItems.value[itemFocusedIdx.value] as IListItem
      }

      return undefined
    })

    // D'n'D
    const draggedItem = ref<IListItem>()
    const dragMeta = ref<IListDragMeta>({
      sourceEl: undefined,
      targetEl: undefined,
      target: undefined,
      placement: undefined,
      dropIndicatorCSS: undefined,
    })

    const isDragging = computed(() => !!draggedItem.value)

    // Emits
    const emits = ref<IListEmitFncs>({
      select: _item => {},
      unselect: _item => {},
      add: _item => {},
      remove: _item => {},
      itemClick: _row => {},
      groupClick: _row => {},
      itemMoved: (_item, _items) => {},
    })

    const returnedData = {
      // Configs
      modifiers,
      loadData,
      sortingConfig,
      selectionConfig,
      addConfig,
      searchConfig,
      ui,

      // Utils
      refreshTrigger,
      isLoadingSource,
      itemKey,
      itemLabel,
      isLoading,
      abortController,
      isRequestLoading,
      handleRequest,

      // Layout
      containerEl,
      listEl,
      isFocusedWithin,
      rowComponent,
      isMounted,
      isClearable,
      noFilter,

      // Search
      search,
      searchEl,
      hasExactMatch,
      fuseOptions,

      // Items
      items,
      hiddenItems,
      itemByKey,
      listItems,

      // Grouping
      groupBy,

      // Selection
      selection,
      handleSelect,

      // Adding
      preAddedItem,
      addedItems,
      addedItemById,
      addItemArk: $v,

      // Focus
      itemFocused,
      itemFocusedIdx,

      // Data fetching
      isFirstFetch,
      hasMore,
      isFetchMore,
      fetchData,
      fetchAndSetData,

      // D'n'D
      draggedItem,
      dragMeta,
      isDragging,

      // Emits
      emits,
    }

    return returnedData
  }, { injectionKey })

  return injectionState
}

export function useListStore(payload?: IConfig) {
  let injectionKey = payload?.injectionKey ?? injectLocal(LIST_ID_KEY)

  if (!injectionKey) {
    const uuid = generateUUID()
    provideLocal(LIST_ID_KEY, uuid)
    injectionKey = uuid
  }

  const [useProvideListStore, useConsumeListStore] = createStore(injectionKey)!

  return useConsumeListStore() ?? useProvideListStore(payload)
}

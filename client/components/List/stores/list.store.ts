import { ZodSchema } from 'zod'
import { skipHydrate } from 'pinia'
import type { Required } from 'utility-types'
import type { GroupItem, SortItem } from '$utils'
import type { IGroupRow } from '$utilsLayer/shared/composables/useGrouping'

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
import { getComponentProps } from '../../../functions/get-component-props'
import { isListItemSelected } from '../functions/helpers/is-list-item-selected'
import { getListDefaultSortBy } from '../functions/helpers/get-list-default-sort-by'

// Components
import type SearchInput from '../../Inputs/TextInput/SearchInput.vue'

export const listIdKey = Symbol('__listId')

export function useListStore(listId?: string, listProps?: IListProps) {
  const _listId = injectLocal(listIdKey, listId ?? useId())

  return defineStore(`list.${_listId}`, () => {
    // Store
    const { lastPointerDownType } = storeToRefs(useUIStore())

    // Configs
    const modifiers = ref<IListProps['modifiers']>(listProps?.modifiers)
    const loadData = ref<IListProps['loadData']>(
      listProps?.loadData ?? getComponentProps('list').loadData(),
    )

    // Utils
    const isLoadingSource = ref(listProps?.loading ?? false)
    const { isLoading: isRequestLoading, handleRequest, abortController } = useRequest()
    const itemKey = toRef(listProps ?? {}, 'itemKey', 'id')
    const itemLabel = toRef(listProps ?? {}, 'itemLabel', 'label')

    const isLoading = computed(() => {
      return isRequestLoading.value || isLoadingSource.value
    })

    // Layout
    const isMounted = ref(false)
    const isClearable = ref(listProps?.clearable)
    const containerEl = ref<HTMLDivElement>()
    const listEl = ref<any>() // Instance of VirtualScroller (~ type is broken somehow...)
    const noFilter = ref(listProps?.noFilter)
    const itemFocusedIdx = ref(-1)
    const rowComponent = ref(listProps?.rowComponent ?? 'div')

    const itemFocused = computed(() => {
      if (itemFocusedIdx.value > -1) {
        return listItems.value[itemFocusedIdx.value] as IListItem
      }

      return undefined
    })

    // Search
    const hasExactMatch = ref(false)
    const searchEl = ref<InstanceType<typeof SearchInput>>()
    const search = ref (listProps?.search)

    const searchConfig = ref<IListProps['searchConfig']>(
      listProps?.searchConfig ?? getComponentProps('list').searchConfig(),
    )

    const fuseOptions = ref<Required<FuseOptions<IItem>, 'keys'>>({
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
    const groupBySource = ref(listProps?.groupBy ?? []) as Ref<NonNullable<IListProps['groupBy']>>

    const groupBy = computed<GroupItem[]>(() => {
      return groupBySource.value.map(g => ({
        ...g,
        format: ({ ref }) => g.format?.(ref) || get(ref, g.field),
      }))
    })

    // Sorting
    const sortingConfig = ref<IListProps['sortingConfig']>(
      listProps?.sortingConfig ?? getComponentProps('list').sortingConfig?.(),
    )

    // We make sure to have at least one sortBy item
    if (sortingConfig.value) {
      const defaultSortBy = getListDefaultSortBy(itemLabel.value)
      sortingConfig.value.sortBy = defaultSortBy
    }

    const sortBy = computed<SortItem[]>(() => {
      return (sortingConfig.value?.sortBy ?? []).map(s => ({
        ...s,
        format: ({ ref }) => s.format?.(ref) || get(ref, s.field),
      })) ?? []
    })

    // Adding
    const preAddedItem = ref<IListItemToAdd>()
    const addedItems = ref<IListItemToAdd[]>([])
    const addConfig = ref<IListProps['addConfig']>(
      listProps?.addConfig ?? getComponentProps('list').addConfig(),
    )

    const addedItemById = computed(() => {
      return addedItems.value.reduce((agg, item) => {
        agg[item.id] = item

        return agg
      }, {} as Record<string, IListItemToAdd>)
    })

    // Add validation
    const validation = addConfig.value?.validation as NonNullable<IListProps['addConfig']>['validation']
    let validationSchemaKey = 'search'
    let validationSchema: ZodSchema | undefined

    if (validation instanceof ZodSchema) {
      validationSchema = validation
    } else if (validation) {
      validationSchemaKey = validation.key
      // @ts-expect-error
      validationSchema = validation.schema.shape[validation.key] as ZodSchema
    }

    const $zAddItem = useZod(
      { [validationSchemaKey]: validationSchema ?? z.any() },
      { [validationSchemaKey]: search },
      { scope: '_list-add-item' },
    )

    // Items
    const items = ref<IItem[]>(listProps?.items ?? [])
    const itemsGrouped = ref<Array<IListItem | IGroupRow>>()
    const hiddenItems = ref<IListProps['hiddenItems']>(listProps?.hiddenItems)
    const useWorker = computed(() => listProps?.useWorker ?? items.value.length > 5e3)

    const itemByKey = computed(() => {
      const allItems = [...items.value, ...addedItems.value.map(item => item.ref)]

      return allItems.reduce((agg, item) => {
        const _itemKey = getListItemKey(item, itemKey.value)
        agg[_itemKey] = item

        return agg
      }, {} as Record<string, IItem>)
    })

    const isHiddenByItemKey = computed(() => {
      return hiddenItems.value?.reduce<Record<string, boolean>>((agg, item) => {
        const _itemKey = getListItemKey(item, itemKey.value)
        agg[_itemKey] = true

        return agg
      }, {} as Record<string, boolean>) ?? {}
    })

    watch(search, () => {
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
      ([items, addedItems, isHiddenByItemKey]),
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
          $z: $zAddItem,
        })

        itemsGrouped.value = res.items

        // Prefocus first item non-group item if out of bounds or
        const isNothingFocused = itemFocusedIdx.value === -1
        const isOutOfBounds = itemFocusedIdx.value > listItems.value.length - 1
        const isGroupFocused = 'isGroup' in (listItems.value[itemFocusedIdx.value] ?? {})

        if (isNothingFocused || isOutOfBounds || isGroupFocused) {
          const firstNonGroupItemIndex = listItems.value.findIndex(item => !('isGroup' in item))
          itemFocusedIdx.value = firstNonGroupItemIndex
        }
      },
      { debounce: () => isMounted.value ? 10 : 0 }, // To prevent double-trigger when adding items
    )

    const listItems = computed(() => {
      return [
        ...(preAddedItem.value ? [preAddedItem.value] : []),
        ...itemsGrouped.value ?? [],
      ]
    })

    // Selection
    const selection = ref(listProps?.selection)

    const selectionConfig = ref<IListProps['selectionConfig']>(
      listProps?.selectionConfig ?? getComponentProps('list').selectionConfig(),
    )

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
        $z: $zAddItem,
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
        lastVisibleRow: listItems.value.at(-1) as IListItem,
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

    return {
      // Configs
      loadData,
      modifiers,

      // Layout
      itemKey,
      itemLabel,
      containerEl,
      listEl,
      rowComponent,
      isLoadingSource,
      isLoading,
      noFilter,
      isMounted,
      isClearable,

      // Focus
      itemFocusedIdx,
      itemFocused,

      // Search
      search,
      hasExactMatch,
      searchEl,
      searchConfig,
      fuseOptions,

      // Items
      items,
      hiddenItems,
      itemByKey,
      listItems,

      // Selection
      selection,
      selectionConfig,
      handleSelect,

      // Sorting
      sortingConfig: skipHydrate(sortingConfig),

      // Adding
      preAddedItem,
      addedItems,
      addConfig,
      addedItemById,
      $zAddItem,

      // Grouping
      groupBy,

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
  })()
}

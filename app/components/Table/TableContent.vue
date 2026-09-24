<script setup lang="ts">
// Types
import type { ITableProps } from './types/table-props.type'
import type { TableColumn } from './models/table-column.model'
import type { IVirtualScrollEvent } from '../VirtualScroller/types/virtual-scroll-event.type'

// Store
import { useTableStore } from './stores/table.store'
import { useTableCellNavigation } from './composables/useTableCellNavigation'

// Constants
import { TABLE_DEFAULT_PROPS } from './constants/table-default-props.constant'

// Components
import VirtualScroller from '../VirtualScroller/VirtualScroller.vue'
import VirtualScrollerVertical from '../VirtualScroller/VirtualScrollerVertical.vue'

type IProps = Pick<ITableProps, 'editable' | 'freeze' | 'ui' | 'to' | 'scrollerConfig' | 'showCopyBtn' | 'toLinkProps'>

const props = defineProps<IProps>()
const scrollerConfig = toRef(props, 'scrollerConfig')

type SlotProps = {
  row: any
  index: number
  columns: TableColumn[]
  style: any
}

// Constants
const FETCH_MORE_THRESHOLD = 10

// Store
const tableStore = useTableStore()
const {
  rowKey,
  rowsSplit,
  tableEl,
  virtualScrollEl,
  visibleColumns,
  cellEdit,
  isCardView,
  hasMore,
  isFetchMore,
  paginationConfig,
  isDataLoading,
  loadData,
} = tableStore

// Layout
const SCROLLER_COMPONENTS = {
  VirtualScroller,
  VirtualScrollerVertical,
} as const

const virtualScrollComponent = computed(() => {
  const component = scrollerConfig.value?.scrollerComponent

  if (!component) {
    return VirtualScroller
  }

  if (typeof component === 'string') {
    return SCROLLER_COMPONENTS[component as keyof typeof SCROLLER_COMPONENTS] ?? component
  }

  return component
})

const scrollerProps = computed(() => {
  const config = scrollerConfig.value

  if (!config) {
    return undefined
  }

  const { scrollerComponent: _, ...rest } = config

  return rest
})

const contentClass = computed(() => {
  return props.ui?.contentClass?.({
    defaults: TABLE_DEFAULT_PROPS.ui.contentClass(),
  })
})

const contentStyle = computed(() => {
  return props.ui?.contentStyle?.()
})

async function handleVirtualScroll(ev: IVirtualScrollEvent) {
  const { visibleEndItem } = ev
  const isFetchMore = rowsSplit.value.length - visibleEndItem.index - 1 < FETCH_MORE_THRESHOLD
  let shouldFetchMore = true

  if (loadData.value?.onVirtualScroll) {
    const virtualScrollResult = await loadData.value.onVirtualScroll({
      ev,
      isFetchMore,
      getStore: () => tableStore,
    })

    if (virtualScrollResult === false) {
      shouldFetchMore = false
    }
  }

  if (
    isFetchMore
    && hasMore.value
    && shouldFetchMore
    && !paginationConfig.value?.enabled
    && !isDataLoading.value
  ) {
    tableStore.fetchAndSetData({ isFetchMore: true })
  }
}

/**
/**
 * Watch for cell edits and update the row height.
 */
watch(cellEdit, (current, previous) => {
  const keys = new Set([...current, ...previous].map(edit => String(edit.row[rowKey.value])))
  const affectedRows = new Set<HTMLElement>()

  for (const cell of tableEl.value?.querySelectorAll<HTMLElement>('[data-field][data-key]') ?? []) {
    if (keys.has(cell.dataset.key!)) {
      const row = cell.closest<HTMLElement>('.content-row')
      if (row) {
        affectedRows.add(row)
      }
    }
  }

  for (const row of affectedRows) {
    virtualScrollEl.value?.updateRowHeight(row)
  }
}, { flush: 'post' })

useTableCellNavigation(tableStore, toRef(props, 'editable'))
</script>

<template>
  <Component
    :is="virtualScrollComponent"
    ref="virtualScrollEl"
    v-bind="scrollerProps"
    :rows="rowsSplit"
    :columns="isCardView ? undefined : visibleColumns"
    class="table-content grow min-h-0"
    :row-key
    :fetch-more="isFetchMore"
    :class="contentClass"
    :style="contentStyle"
    @virtual-scroll="handleVirtualScroll"
  >
    <template #default="slotProps: SlotProps">
      <slot
        name="row"
        :row="slotProps.row"
        :index="slotProps.index"
        :columns="slotProps.columns ?? visibleColumns"
      >
        <!-- No slots: the row renders the table's cell slots itself (see `TableRow`),
             so it only re-renders when its own props or data change -->
        <TableRow
          :row="slotProps.row"
          :ui
          :index="slotProps.index"
          :editable
          :freeze
          :to
          :show-copy-btn
          :to-link-props
          :visible-columns="slotProps.columns ?? visibleColumns"
          :style="slotProps.style"
        />
      </slot>
    </template>
  </Component>
</template>

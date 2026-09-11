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
import VirtualScrollerGrid from '../VirtualScroller/VirtualScrollerGrid.vue'
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
  hasMore,
  isFetchMore,
  paginationConfig,
  isDataLoading,
  loadData,
} = tableStore

// Layout
const isVisibleByColumnField = ref<Record<string, boolean>>({})

const SCROLLER_COMPONENTS = {
  VirtualScroller,
  VirtualScrollerGrid,
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
    :columns="visibleColumns"
    class="table-content grow"
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
        <TableRow
          :row="slotProps.row"
          :ui
          :index="slotProps.index"
          :editable
          :freeze
          :to
          :show-copy-btn
          :to-link-props
          :is-visible-by-column-field
          :visible-columns="slotProps.columns ?? visibleColumns"
          :style="slotProps.style"
        >
          <template v-if="$slots['row-actions']" #row-actions="actions">
            <slot name="row-actions" v-bind="actions" />
          </template>

          <!-- Field slots -->
          <template
            v-for="col in slotProps.columns ?? visibleColumns"
            :key="col.name"
            #[col.name]="{ row, column, value }"
          >
            <slot
              :name="col.name"
              :row
              :index="slotProps.index"
              :column
              :value
            />
          </template>

          <!-- Row inside slot -->
          <template #inner="rowInsideProps">
            <slot
              name="row-inside"
              v-bind="rowInsideProps"
              :index="slotProps.index"
            />
          </template>
        </TableRow>
      </slot>
    </template>
  </Component>
</template>

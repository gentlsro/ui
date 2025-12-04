<script setup lang="ts" generic="T extends IItem">
import { getRect } from 'mezr'
import { useVirtualizer } from '@tanstack/vue-virtual'

// Types
import type { IVirtualScrollEvent } from './types/virtual-scroll-event.type'

// Models
import type { TableColumn } from '../Table/models/table-column.model'

// Functions
import { getComponentProps } from '../../functions/get-component-props'

type IProps<T extends IItem> = {
  rows: T[]
  columns: TableColumn<T>[]
  rowHeight?: number
  rowKey?: keyof T
}

const props = withDefaults(
  defineProps<IProps<T>>(),
  { ...getComponentProps('virtualScroller') },
)
const emits = defineEmits<{
  (e: 'virtualScroll', payload: IVirtualScrollEvent): void
  (e: 'change:contentSize', payload: { height: number, width: number }): void
}>()

// Layout
const rows = toRef(props, 'rows')
const columns = toRef(props, 'columns')
const containerEl = useTemplateRef('containerEl')
const contentEl = useTemplateRef('contentEl')

// Row virtualizer
const rowVirtualizerOptions = computed(() => {
  return {
    count: rows.value.length,
    scrollMargin: 0,
    overscan: 5,
    getScrollElement: () => containerEl.value,
    estimateSize: () => props.rowHeight ?? 28,
    getItemKey: (idx: number) => rows.value[idx]?.[props.rowKey ?? 'id'],
  }
})

const rowVirtualizer = useVirtualizer(rowVirtualizerOptions)

const virtualRows = computed(() => {
  return rowVirtualizer.value.getVirtualItems()
})

const totalHeight = computed(() => {
  return rowVirtualizer.value.getTotalSize()
})

// Column virtualizer
const columnWidths = computed(() => {
  return columns.value.map((col: any) => col._width).join(',')
})

const columnVirtualizerOptions = computedWithControl(
  [columnWidths],
  () => {
    return {
      horizontal: true,
      count: columns.value.length,
      overscan: 1,
      estimateSize: (idx: number) => columns.value[idx]?._width ?? 0,
      getScrollElement: () => containerEl.value,
      getItemKey: (idx: number) => columns.value[idx]?.field,
    }
  },
)

const columnVirtualizer = useVirtualizer(columnVirtualizerOptions)

const virtualColumns = computed(() => {
  return columnVirtualizer.value.getVirtualItems()
})

const visibleColumns = computed(() => {
  return virtualColumns.value
    .map(virtualColumn => columns.value[virtualColumn.index]) as TableColumn<T>[]
})

const totalWidth = computed(() => {
  return columnVirtualizer.value.getTotalSize()
})

const columnWidth = computed(() => {
  if (!virtualColumns.value.length) {
    return [0, 0]
  }

  const totalSize = columnVirtualizer.value.getTotalSize()
  const virtualColumnsStart = virtualColumns.value.at(0)?.start ?? 0
  const virtualColumnsEnd = virtualColumns.value.at(-1)?.end ?? 0

  return [
    virtualColumnsStart,
    totalSize - virtualColumnsEnd,
  ] as const
})

function getColumnWidth(index: number) {
  return columns.value[index]?._width ?? 0
}

function measureElement(el?: any) {
  if (!el) {
    return
  }

  rowVirtualizer.value.measureElement(el)

  return undefined
}

const contentStyle = computed(() => {
  return {
    height: `${totalHeight.value}px`,
    width: `${totalWidth.value}px`,
  }
})

// Virtual scrolling
const { x, y } = useScroll(containerEl)
const { height } = useElementSize(containerEl)

const virtualEdges = computed(() => {
  return {
    firstRow: virtualRows.value.at(0),
    lastRow: virtualRows.value.at(-1),
    firstColumn: virtualColumns.value.at(0),
    lastColumn: virtualColumns.value.at(-1),
  }
})

// Emit the virtual scroll event
function emitVirtualScrollEvent() {
  const firstVisible = rowVirtualizer.value.getVirtualItemForOffset(y.value)
  const lastVisible = rowVirtualizer.value.getVirtualItemForOffset(y.value + height.value)

  // @ts-expect-error Idk
  emits('virtualScroll', {
    visibleStartItem: firstVisible,
    visibleEndItem: lastVisible,
    virtualStartItem: virtualEdges.value.firstRow,
    virtualEndItem: virtualEdges.value.lastRow,
  })
}

watchThrottled(
  [x, y],
  emitVirtualScrollEvent,
  { immediate: true, throttle: 5, leading: false, trailing: true },
)

// Emit the content size event
watchThrottled(
  [totalHeight, totalWidth],
  ([totalHeight, totalWidth]) => {
    emits('change:contentSize', { height: totalHeight, width: totalWidth })

    emitVirtualScrollEvent()
  },
  { immediate: true, throttle: 5, leading: false, trailing: true },
)

defineExpose({
  scrollToTop: () => rowVirtualizer.value.scrollToOffset(0),
  scrollToBottom: () => rowVirtualizer.value.scrollToOffset(rowVirtualizer.value.getTotalSize()),
  scrollTo: (idx: number) => rowVirtualizer.value.scrollToIndex(idx),
  focus: () => containerEl.value?.focus(),
  rerender: () => {},
  clear: () => {},
  triggerScrollEvent: () => {},
  renderOnlyVisible: () => {},
  updateRowHeight: () => {},
  getDimensions: () => ({
    virtualScroll: getRect(unrefElement(containerEl.value) as HTMLElement),
    container: getRect(unrefElement(contentEl.value) as HTMLElement),
  }),
})
</script>

<template>
  <div
    ref="containerEl"
    class="virtual-scroll"
    tabindex="0"
  >
    <div
      ref="contentEl"
      class="virtual-scroll__content"
      :style="contentStyle"
    >
      <template
        v-for="virtualRow in virtualRows"
        :key="virtualRow.key"
      >
        <div
          :ref="measureElement"
          :data-index="virtualRow.index"
          :data-idx="virtualRow.index"
          :data-key="virtualRow.key"
          class="virtual-scroll__row content-row"
          :style="{
            'position': 'absolute',
            'top': 0,
            'left': 0,
            'transform': `translateY(${virtualRow.start - rowVirtualizer.options.scrollMargin}px)`,
            'display': 'flex',
            '--rowHeight': `${virtualRow.size}px`,
          }"
        >
          <!-- Empty space - Left -->
          <div :style="{ width: `${columnWidth[0]}px` }" />

          <!-- Columns content -->
          <slot
            :columns="visibleColumns"
            :row="rows[virtualRow.index]"
            :index="virtualRow.index"
            :style="{ minHeight: `${rowHeight}px` }"
          />

          <!-- Empty space - Right -->
          <div :style="{ width: `${columnWidth[1]}px` }" />
        </div>
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.virtual-scroll {
  @apply relative overflow-auto outline-none;

  &__content {
    @apply relative;
  }
}
</style>

<script setup lang="ts" vapor generic="T">
import type { CSSProperties } from 'vue'
import { defaultRangeExtractor, useVirtualizer } from '@tanstack/vue-virtual'
import type { Range, VirtualItem } from '@tanstack/vue-virtual'
import type { IVirtualScrollEvent } from './types/virtual-scroll-event.type'
import type { IVirtualScrollerProps } from './types/virtual-scroller-props.type'
import { VIRTUAL_SCROLLER_DEFAULT_PROPS } from './constants/virtual-scroller-default-props'

// A native block owns the styled viewport; attributes still target the real
// scroll element rather than leaking onto the interop boundary.
defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<IVirtualScrollerProps<T>>(), {
  ...getComponentProps('virtualScroller'),
  virtualizeColumns: false,
})
const emits = defineEmits<{
  (e: 'virtualScroll', payload: IVirtualScrollEvent): void
  (e: 'change:contentSize', payload: { height: number, width: number }): void
}>()
defineSlots<{
  'inner'?: () => any
  'inner-content'?: () => any
  'default': (props: { row: T, index: number, columns?: TableColumn<T>[], style: CSSProperties }) => any
}>()

const virtualScrollEl = useTemplateRef<HTMLDivElement>('virtualScrollEl')
const contentEl = useTemplateRef<HTMLDivElement>('contentEl')
const viewport = useElementSize(virtualScrollEl)
const contentSize = useElementSize(contentEl)
const mounted = ref(false)
const cleared = ref(false)
const estimateOverride = ref<number>()
const rangeOverride = ref<{ first: number, last: number }>()
const rows = computed(() => props.rows ?? [])
const isVirtual = computed(() => rows.value.length > props.threshold)
const mergedProps = computed(() => getComponentMergedProps('virtualScroller', props))
const initialCount = props.initialRowsRenderCount ?? Math.ceil(2160 / props.rowHeight)

function getItemKey(index: number) {
  const row = rows.value[index]

  return get(Array.isArray(row) ? row[0] : row, props.rowKey) ?? index
}

const extractRange = computed(() => {
  const hidden = cleared.value
  const fixed = rangeOverride.value ?? (!isVirtual.value
    ? { first: 0, last: rows.value.length - 1 }
    : undefined)

  return (range: Range) => {
    if (hidden) {
      return []
    }
    if (fixed) {
      const last = Math.min(fixed.last, range.count - 1)

      return Array.from({ length: Math.max(0, last - fixed.first + 1) }, (_, index) => fixed.first + index)
    }

    return defaultRangeExtractor(range)
  }
})

const rowVirtualizer = useVirtualizer<HTMLDivElement, HTMLDivElement>(computed(() => ({
  count: rows.value.length,
  getScrollElement: () => virtualScrollEl.value,
  estimateSize: () => estimateOverride.value ?? props.rowHeight,
  getItemKey,
  rangeExtractor: extractRange.value,
  initialRect: { width: 0, height: initialCount * props.rowHeight },
  overscan: mounted.value ? Math.ceil(Math.max(props.overscan?.top ?? 400, props.overscan?.bottom ?? 800) / props.rowHeight) : 0,
})))
const virtualRows = computed(() => rowVirtualizer.value.getVirtualItems())
const totalHeight = computed(() => rowVirtualizer.value.getTotalSize())

// Reuse the grid's two-axis design: TanStack owns column ranges and offsets,
// while the slot receives only the columns between its virtual edges.
const columns = computed(() => props.columns ?? [])
const hasColumns = computed(() => !!columns.value.length && props.virtualizeColumns !== false)
const columnWidths = computed(() => columns.value.map(column => {
  // Before header DOM exists, explicit px widths give SSR a useful estimate.
  return column._width || (column.width.endsWith('px') ? Number.parseFloat(column.width) : 200)
}))
const columnVirtualizer = useVirtualizer<HTMLDivElement, HTMLDivElement>(computed(() => ({
  count: hasColumns.value ? columns.value.length : 0,
  horizontal: true,
  enabled: hasColumns.value,
  getScrollElement: () => virtualScrollEl.value,
  getItemKey: (index: number) => String(columns.value[index].field),
  estimateSize: (index: number) => columnWidths.value[index],
  initialRect: { width: 1280, height: 0 },
  overscan: mounted.value ? 1 : 0,
})))
const virtualColumns = computed(() => columnVirtualizer.value.getVirtualItems())
const visibleColumns = computed(() => hasColumns.value
  ? virtualColumns.value.map(item => columns.value[item.index])
  : props.columns)
const totalWidth = computed(() => hasColumns.value ? columnVirtualizer.value.getTotalSize() : undefined)
const columnPadding = computed(() => ({
  paddingLeft: `${virtualColumns.value[0]?.start ?? 0}px`,
  paddingRight: `${(totalWidth.value ?? 0) - (virtualColumns.value.at(-1)?.end ?? 0)}px`,
}))
watch(columnWidths, () => {
  columnVirtualizer.value.measure()
})

function scrollToColumn(index: number) {
  columnVirtualizer.value.scrollToIndex(index, { align: 'start' })
}

function measureRow(el: HTMLDivElement | null) {
  // Vapor assigns function refs before insertion. Measuring that detached row
  // as zero would make TanStack compensate the scroll offset when it grows.
  nextTick(() => {
    if (!el || el.isConnected) {
      rowVirtualizer.value.measureElement(el)
    }
  })
}

function eventItem(item: VirtualItem) {
  return { index: item.index, key: String(item.key), size: item.size }
}

function emitVirtualScroll() {
  if (!mounted.value || props.noScrollEmit || !rows.value.length || !viewport.height.value) {
    return
  }
  const virtualizer = rowVirtualizer.value
  const offset = virtualScrollEl.value?.scrollTop ?? virtualizer.scrollOffset ?? 0
  const first = virtualizer.getVirtualItemForOffset(offset)
  const last = virtualizer.getVirtualItemForOffset(offset + viewport.height.value - 1)
  if (!first || !last) {
    return
  }
  emits('virtualScroll', {
    visibleStartItem: eventItem(first),
    visibleEndItem: eventItem(last),
    virtualStartItem: virtualRows.value[0] && eventItem(virtualRows.value[0]),
    virtualEndItem: virtualRows.value.at(-1) && eventItem(virtualRows.value.at(-1)!),
  })
}

// Loading another page need not change scrollTop or even the content's DOM
// height. Re-evaluate the visible end after every page and viewport change.
const scrollTask = useRafTask<void>(emitVirtualScroll)
watch(() => rowVirtualizer.value.scrollOffset, () => {
  rangeOverride.value = undefined
  scrollTask.schedule()
})
watch(
  [rows, viewport.height, totalHeight],
  ([data, height, total], [previousData, previousHeight]) => {
    const replacing = data !== previousData && !props.fetchMore
    if (replacing || height !== previousHeight || total <= height) {
      scrollTask.schedule()
    }
  },
  { flush: 'post' },
)
watch([contentSize.height, contentSize.width], ([height, width]) => {
  emits('change:contentSize', { height, width })
})

watch(rows, () => {
  cleared.value = false
  rangeOverride.value = undefined
  if (!props.fetchMore) {
    estimateOverride.value = undefined
    rerender(true)
  }
})
watch(viewport.width, () => {
  if (mounted.value && props.watchWidth !== false) {
    rerender(true)
  }
})

function rerender(noEmit = false, resetHeights = true) {
  cleared.value = false
  rangeOverride.value = undefined
  if (resetHeights) {
    rowVirtualizer.value.measure()
  }
  nextTick(() => {
    contentEl.value?.querySelectorAll<HTMLDivElement>(':scope > [data-index]').forEach(measureRow)
    if (!noEmit) {
      scrollTask.schedule()
    }
  })
}

function scrollTo(index: number) {
  rangeOverride.value = undefined
  rowVirtualizer.value.scrollToIndex(index, { align: 'start' })
}

function scrollToBottom(_payload?: { makeSure?: boolean }) {
  rangeOverride.value = undefined
  rowVirtualizer.value.scrollToIndex(rows.value.length - 1, { align: 'end' })
}

function renderOnlyVisible(alsoRerender?: boolean, options?: { firstIdx?: number, lastIdx?: number, rowHeight?: number }) {
  const virtualizer = rowVirtualizer.value
  const range = virtualizer.calculateRange()
  const first = options?.firstIdx ?? range?.startIndex ?? 0
  const last = options?.lastIdx ?? (options?.rowHeight
    ? first + Math.ceil(viewport.height.value / options.rowHeight)
    : range?.endIndex ?? first)
  rangeOverride.value = { first, last }
  if (alsoRerender) {
    virtualizer.measure()
    virtualizer.calculateRange()
  }
  // calculateRange refreshes the public cache, including offscreen estimates.
  const rendered = virtualizer.measurementsCache.slice(first, last + 1).map(item => ({
    ref: rows.value[item.index],
    id: item.key,
    idx: item.index,
    style: { '--translateY': item.start },
  }))

  return { rows: rendered, firstRow: rendered[0] ?? null, lastRow: rendered.at(-1) ?? null }
}

defineExpose({
  element: virtualScrollEl,
  scrollToTop: () => scrollTo(0),
  scrollToBottom,
  scrollTo,
  scrollToColumn,
  scrollToCell: (position: { rowIndex: number, columnIndex: number }) => {
    scrollTo(position.rowIndex)
    scrollToColumn(position.columnIndex)
  },
  focus: () => virtualScrollEl.value?.focus(),
  rerender,
  clear: (payload?: { rowHeight?: number }) => {
    estimateOverride.value = payload?.rowHeight
    cleared.value = true
    rowVirtualizer.value.measure()
  },
  triggerScrollEvent: emitVirtualScroll,
  renderOnlyVisible,
  updateRowHeight: (el: HTMLDivElement) => {
    if (el?.parentElement === contentEl.value) {
      measureRow(el)
    }
  },
  getDimensions: () => ({ virtualScroll: viewport, container: contentSize }),
})
onMounted(() => {
  mounted.value = true
  scrollTask.schedule()
})

const containerClass = computed(() => mergedProps.value.ui?.containerClass?.({
  defaults: VIRTUAL_SCROLLER_DEFAULT_PROPS.ui.containerClass(),
}))
const containerStyle = computed(() => mergedProps.value.ui?.containerStyle?.())
const contentClass = computed(() => mergedProps.value.ui?.contentClass?.({
  defaults: VIRTUAL_SCROLLER_DEFAULT_PROPS.ui.contentClass(),
}))
const contentStyle = computed(() => ({
  ...mergedProps.value.ui?.contentStyle?.(),
  minHeight: `${totalHeight.value}px`,
  ...(totalWidth.value === undefined ? {} : { width: `${totalWidth.value}px` }),
}))
const rowClass = computed(() => mergedProps.value.ui?.rowClass?.({
  defaults: VIRTUAL_SCROLLER_DEFAULT_PROPS.ui.rowClass(),
}))
const rowStyle = computed(() => mergedProps.value.ui?.rowStyle?.())
</script>

<template>
  <div class="contents">
    <div
      ref="virtualScrollEl"
      v-bind="$attrs"
      class="virtual-scroll"
      :class="[containerClass, { 'is-virtual': mounted && isVirtual }]"
      :style="containerStyle"
      tabindex="0"
    >
      <div
        ref="contentEl"
        class="virtual-scroll__content"
        :class="contentClass"
        :style="contentStyle"
      >
        <div
          v-for="item in virtualRows"
          :key="item.key"
          :ref="measureRow"
          :data-index="item.index"
          :data-idx="item.index"
          :data-key="item.key"
          class="virtual-scroll__row content-row"
          :class="rowClass"
          :style="{
            ...rowStyle,
            ...(hasColumns ? columnPadding : {}),
            'minHeight': `${rowHeight}px`,
            '--rowHeight': item.size,
            '--translateY': item.start,
          }"
        >
          <slot
            :row="rows[item.index]!"
            :index="item.index"
            :columns="visibleColumns"
            :style="{ minHeight: `${rowHeight}px` }"
          >
            {{ rows[item.index] }}
          </slot>
        </div>
        <slot name="inner-content" />
        <slot name="inner" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.virtual-scroll {
  @apply relative overflow-auto outline-none;
}

.virtual-scroll__content {
  @apply relative;
}

.virtual-scroll__row {
  @apply flex w-full;

  transform: translate3d(var(--translate3D, 0, 0, 0));
}

.virtual-scroll.is-virtual .virtual-scroll__row {
  @apply absolute left-0 top-0;

  transform: translateY(calc(var(--translateY) * 1px)) translate3d(var(--translate3D, 0, 0, 0));
}
</style>

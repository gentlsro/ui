<script setup lang="ts" generic="T">
import type { ComponentPublicInstance, CSSProperties } from 'vue'
import { get } from 'lodash-es'
import { defaultRangeExtractor, useVirtualizer } from '@tanstack/vue-virtual'
import type { Range, VirtualItem } from '@tanstack/vue-virtual'
import type { IVirtualScrollEvent } from './types/virtual-scroll-event.type'
import type { IVirtualScrollerProps } from './types/virtual-scroller-props.type'
import { getElementSize } from '#layers/utilities/app/functions/get-element-size'
import { VIRTUAL_SCROLLER_DEFAULT_PROPS } from './constants/virtual-scroller-default-props'

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

// Viewport and data
const virtualScrollEl = useTemplateRef<HTMLDivElement>('virtualScrollEl')
const contentEl = useTemplateRef<HTMLDivElement>('contentEl')
const viewport = useElementSize(virtualScrollEl)
const contentSize = useElementSize(contentEl)
const isMounted = ref(false)
const rows = computed(() => props.rows ?? [])
const isVirtual = computed(() => rows.value.length > props.threshold)
const mergedProps = computed(() => getComponentMergedProps('virtualScroller', props))

// Row virtualization
const cleared = ref(false)
const estimateOverride = ref<number>()
const rangeOverride = ref<{ first: number, last: number }>()
const initialCount = props.initialRowsRenderCount ?? Math.ceil(2160 / props.rowHeight)

function getItemKey(index: number) {
  const row = rows.value[index]

  return get(Array.isArray(row) ? row[0] : row, props.rowKey) ?? index
}

const rowRangeExtractor = computed(() => {
  if (cleared.value) {
    return () => []
  }

  const fixedRange = rangeOverride.value ?? (isVirtual.value
    ? undefined
    : { first: 0, last: rows.value.length - 1 })

  if (!fixedRange) {
    return defaultRangeExtractor
  }

  return (range: Range) => {
    const last = Math.min(fixedRange.last, range.count - 1)
    const count = Math.max(0, last - fixedRange.first + 1)

    return Array.from({ length: count }, (_, index) => fixedRange.first + index)
  }
})
const rowOverscan = computed(() => {
  if (!isMounted.value) {
    return 0
  }

  const pixels = Math.max(props.overscan?.top ?? 400, props.overscan?.bottom ?? 800)

  return Math.ceil(pixels / props.rowHeight)
})

const rowVirtualizer = useVirtualizer<HTMLDivElement, HTMLDivElement>(computed(() => ({
  count: rows.value.length,
  getScrollElement: () => virtualScrollEl.value,
  estimateSize: () => estimateOverride.value ?? props.rowHeight,
  getItemKey,
  rangeExtractor: rowRangeExtractor.value,
  initialRect: { width: 0, height: initialCount * props.rowHeight },
  overscan: rowOverscan.value,
})))
const virtualRows = computed(() => rowVirtualizer.value
  .getVirtualItems()
  .map(item => ({ ...item, row: rows.value[item.index] }))
  .filter((item): item is VirtualItem & { row: T } => item.row !== undefined))
const totalHeight = computed(() => rowVirtualizer.value.getTotalSize())

// Column virtualization
const columns = computed(() => props.columns ?? [])
const hasVirtualColumns = computed(() => props.virtualizeColumns && columns.value.length > 0)

// Before header DOM exists, explicit px widths give SSR a useful estimate.
const columnWidths = computed(() => columns.value.map(column => {
  return column._width || (column.width.endsWith('px') ? Number.parseFloat(column.width) : 200)
}))
const columnVirtualizer = useVirtualizer<HTMLDivElement, HTMLDivElement>(computed(() => ({
  count: hasVirtualColumns.value ? columns.value.length : 0,
  horizontal: true,
  enabled: hasVirtualColumns.value,
  getScrollElement: () => virtualScrollEl.value,
  getItemKey: (index: number) => String(columns.value[index]?.field ?? index),
  estimateSize: (index: number) => columnWidths.value[index] ?? 200,
  initialRect: { width: 1280, height: 0 },
  overscan: isMounted.value ? 1 : 0,
})))
const virtualColumns = computed(() => columnVirtualizer.value.getVirtualItems())
const visibleColumns = computed(() => hasVirtualColumns.value
  ? virtualColumns.value.flatMap(item => columns.value[item.index] ?? [])
  : props.columns)
const totalWidth = computed(() => hasVirtualColumns.value ? columnVirtualizer.value.getTotalSize() : undefined)
const columnPadding = computed(() => ({
  paddingLeft: `${virtualColumns.value[0]?.start ?? 0}px`,
  paddingRight: `${(totalWidth.value ?? 0) - (virtualColumns.value.at(-1)?.end ?? 0)}px`,
}))
watch(columnWidths, () => {
  columnVirtualizer.value.measure()
})

// Row measurement and scroll events
function measureRow(el: Element | ComponentPublicInstance | null) {
  // Function refs can run before the row is attached (e.g. on the first mount).
  // Measuring that detached row as zero would make TanStack compensate the
  // scroll offset when it grows.
  nextTick(() => {
    if (!el || (el instanceof HTMLElement && el.isConnected)) {
      rowVirtualizer.value.measureElement(el as HTMLDivElement | null)
    }
  })
}

function toScrollEventItem(item: VirtualItem) {
  return { index: item.index, key: String(item.key), size: item.size }
}

function emitVirtualScroll() {
  if (!isMounted.value || props.noScrollEmit || !rows.value.length || !viewport.height.value) {
    return
  }

  const virtualizer = rowVirtualizer.value
  const offset = virtualScrollEl.value?.scrollTop ?? virtualizer.scrollOffset ?? 0
  const first = virtualizer.getVirtualItemForOffset(offset)
  const last = virtualizer.getVirtualItemForOffset(offset + viewport.height.value - 1)

  if (!first || !last) {
    return
  }

  const virtualStart = virtualRows.value[0]
  const virtualEnd = virtualRows.value.at(-1)

  emits('virtualScroll', {
    visibleStartItem: toScrollEventItem(first),
    visibleEndItem: toScrollEventItem(last),
    virtualStartItem: virtualStart && toScrollEventItem(virtualStart),
    virtualEndItem: virtualEnd && toScrollEventItem(virtualEnd),
  })
}

// Loading another page need not change scrollTop or even the content's DOM
// height. Re-evaluate the visible end after every page and viewport change.
let scrollFrame: number | undefined
const scrollTask = {
  schedule() {
    scrollFrame ??= requestAnimationFrame(() => {
      scrollFrame = undefined
      emitVirtualScroll()
    })
  },
}
onScopeDispose(() => scrollFrame !== undefined && cancelAnimationFrame(scrollFrame))
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
// Consumers size themselves by this, so include the scroller's own box extras
watch([contentSize.height, contentSize.width], ([height, width]) => {
  const { extra } = virtualScrollEl.value
    ? getElementSize(virtualScrollEl.value, { includeBorder: true, includePadding: true, includeMargin: true })
    : { extra: { vertical: 0, horizontal: 0 } }

  emits('change:contentSize', { height: height + extra.vertical, width: width + extra.horizontal })
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
  if (isMounted.value && props.watchWidth !== false) {
    rerender(true)
  }
})

// Rendering and navigation
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

function scrollToColumn(index: number) {
  columnVirtualizer.value.scrollToIndex(index, { align: 'auto' })
}

function scrollTo(index: number) {
  rangeOverride.value = undefined
  rowVirtualizer.value.scrollToIndex(index, { align: 'start' })
}

function scrollToBottom(_payload?: { makeSure?: boolean }) {
  rangeOverride.value = undefined
  rowVirtualizer.value.scrollToIndex(rows.value.length - 1, { align: 'end' })
}

type VisibleRangeOptions = {
  firstIdx?: number
  lastIdx?: number
  rowHeight?: number
}

function renderOnlyVisible(alsoRerender?: boolean, options: VisibleRangeOptions = {}) {
  const virtualizer = rowVirtualizer.value
  const range = virtualizer.calculateRange()
  const first = options.firstIdx ?? range?.startIndex ?? 0
  const visibleEnd = options.rowHeight
    ? first + Math.ceil(viewport.height.value / options.rowHeight)
    : range?.endIndex ?? first
  const last = options.lastIdx ?? visibleEnd

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

function clear(payload?: { rowHeight?: number }) {
  estimateOverride.value = payload?.rowHeight
  cleared.value = true
  rowVirtualizer.value.measure()
}

function scrollToCell(position: { rowIndex: number, columnIndex: number }) {
  scrollTo(position.rowIndex)
  scrollToColumn(position.columnIndex)
}

function updateRowHeight(el: HTMLDivElement) {
  if (el?.parentElement === contentEl.value) {
    measureRow(el)
  }
}

// Public API
defineExpose({
  element: virtualScrollEl,
  scrollToTop: () => scrollTo(0),
  scrollToBottom,
  scrollTo,
  scrollToColumn,
  scrollToCell,
  focus: () => virtualScrollEl.value?.focus(),
  rerender,
  clear,
  triggerScrollEvent: emitVirtualScroll,
  renderOnlyVisible,
  updateRowHeight,
  getDimensions: () => ({ virtualScroll: viewport, container: contentSize }),
})

onMounted(() => {
  isMounted.value = true
  scrollTask.schedule()
})

// Styles
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
const rowStyle = computed(() => ({
  ...mergedProps.value.ui?.rowStyle?.(),
  ...(hasVirtualColumns.value ? columnPadding.value : {}),
  minHeight: `${props.rowHeight}px`,
}))

// One object for all rows: a new one per render would change every row's props,
// re-rendering all of them whenever the virtualizer updates
const slotStyle = computed(() => ({ minHeight: `${props.rowHeight}px` }))

function getRowStyle(item: VirtualItem) {
  return {
    ...rowStyle.value,
    '--rowHeight': item.size,
    '--translateY': item.start,
  }
}
</script>

<template>
  <div
    ref="virtualScrollEl"
    class="virtual-scroll"
    :class="[containerClass, { 'is-virtual': isMounted && isVirtual }]"
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
        :key="String(item.key)"
        :ref="measureRow"
        :data-index="item.index"
        :data-idx="item.index"
        :data-key="item.key"
        class="virtual-scroll__row content-row"
        :class="rowClass"
        :style="getRowStyle(item)"
      >
        <slot
          :row="item.row"
          :index="item.index"
          :columns="visibleColumns"
          :style="slotStyle"
        >
          {{ item.row }}
        </slot>
      </div>
      <slot name="inner-content" />
      <slot name="inner" />
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

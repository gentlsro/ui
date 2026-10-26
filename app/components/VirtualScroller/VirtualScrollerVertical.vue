<script setup lang="ts" vapor generic="T extends IItem = IItem">
import { getRect } from 'mezr'
import { defaultRangeExtractor, useVirtualizer } from '@tanstack/vue-virtual'
import type { Range, VirtualItem } from '@tanstack/vue-virtual'
import type { IVirtualScrollEvent } from './types/virtual-scroll-event.type'
import type { IVirtualScrollerVerticalProps } from './types/virtual-scroller-vertical-props.type'
import { VIRTUAL_SCROLLER_VERTICAL_DEFAULT_PROPS } from './constants/virtual-scroller-vertical-default-props'
import { addActiveStickyIndex, getActiveStickyIndex, normalizeStickyIndices } from './functions/virtual-scroller-sticky'

const props = withDefaults(defineProps<IVirtualScrollerVerticalProps<T>>(), {
  ...getComponentProps('virtualScrollerVertical'),
})
const emits = defineEmits<{
  (e: 'virtualScroll', payload: IVirtualScrollEvent): void
  (e: 'change:contentSize', payload: { height: number }): void
}>()
const mergedProps = computed(() => getComponentMergedProps('virtualScrollerVertical', props))
const rows = computed(() => props.rows ?? [])
const containerEl = useTemplateRef<HTMLDivElement>('containerEl')
const contentEl = useTemplateRef<HTMLDivElement>('contentEl')
const viewport = useElementSize(containerEl)
const isMounted = ref(false)
let disposed = false
onScopeDispose(() => disposed = true)

const cleared = ref(false)
const estimateOverride = ref<number>()
const rangeOverride = ref<{ first: number, last: number }>()
const scrollMargin = computed(() => props.virtualizerOptions?.scrollMargin ?? 0)
const stickyIndices = computed(() => normalizeStickyIndices(props.stickyIndices))
const stickyIndexSet = computed(() => new Set(stickyIndices.value))

const rangeExtractor = computed(() => {
  if (cleared.value) {
    return () => []
  }
  const fixed = rangeOverride.value
  const sticky = stickyIndices.value

  // TanStack memoizes by extractor identity. Capture reactive options here so
  // clear/range changes invalidate that cache even when scrollTop is unchanged.
  return (range: Range) => {
    const indices = fixed
      ? Array.from({ length: Math.max(0, Math.min(fixed.last, range.count - 1) - fixed.first + 1) }, (_, offset) => fixed.first + offset)
      : defaultRangeExtractor(range)

    return addActiveStickyIndex(indices, {
      activeIndex: getActiveStickyIndex(sticky, range.startIndex),
      count: range.count,
    })
  }
})

const rowVirtualizer = useVirtualizer<HTMLDivElement, HTMLDivElement>(computed(() => ({
  count: rows.value.length,
  getScrollElement: () => containerEl.value,
  estimateSize: () => estimateOverride.value ?? props.rowHeight ?? 28,
  getItemKey: (index: number) => {
    const row = rows.value[index]

    return String(get(Array.isArray(row) ? row[0] : row, props.rowKey ?? 'id') ?? index)
  },
  initialRect: { width: 0, height: Math.min(rows.value.length, props.initialRowsRenderCount ?? 6) * (props.rowHeight ?? 28) },
  ...props.virtualizerOptions,
  rangeExtractor: rangeExtractor.value,
  // This component emits size changes to consumers that can resize ancestors.
  // Keep measurement and notifications outside ResizeObserver delivery.
  useAnimationFrameWithResizeObserver: true,
})))
const virtualRows = computed(() => rowVirtualizer.value.getVirtualItems())
const activeStickyIndex = computed(() => getActiveStickyIndex(stickyIndices.value, rowVirtualizer.value.range?.startIndex))
const renderedVirtualRows = computed(() => virtualRows.value.map(item => ({
  ...item,
  isSticky: stickyIndexSet.value.has(item.index),
  isActiveSticky: activeStickyIndex.value === item.index,
  positionStyle: activeStickyIndex.value === item.index
    ? { position: 'sticky' as const }
    : { 'position': 'absolute' as const, '--translateY': item.start - scrollMargin.value },
})))
const totalHeight = computed(() => rowVirtualizer.value.getTotalSize())
const contentStyle = computed(() => ({ height: `${totalHeight.value}px` }))

function measureElement(target: unknown) {
  const element = typeof HTMLDivElement !== 'undefined' && target instanceof HTMLDivElement ? target : null
  nextTick(() => {
    if (!disposed && (!element || element.isConnected)) {
      rowVirtualizer.value.measureElement(element)
    }
  })
}

function toScrollItem(item: VirtualItem) {
  return { index: item.index, key: String(item.key), size: item.size }
}

function emitVirtualScrollEvent() {
  if (!isMounted.value || disposed || cleared.value || props.noScrollEmit || !rows.value.length || !viewport.height.value) {
    return
  }
  const virtualizer = rowVirtualizer.value
  const offset = containerEl.value?.scrollTop ?? virtualizer.scrollOffset ?? 0
  const first = virtualizer.getVirtualItemForOffset(offset)
  const last = virtualizer.getVirtualItemForOffset(offset + viewport.height.value - 1)
  if (!first || !last) {
    return
  }
  const start = virtualRows.value[0]
  const end = virtualRows.value.at(-1)
  emits('virtualScroll', {
    visibleStartItem: toScrollItem(first),
    visibleEndItem: toScrollItem(last),
    virtualStartItem: start && toScrollItem(start),
    virtualEndItem: end && toScrollItem(end),
  })
}

const scrollTask = useRafTask<void>(emitVirtualScrollEvent)
const contentTask = useRafTask<void>(() => {
  if (isMounted.value) {
    emits('change:contentSize', { height: totalHeight.value })
    scrollTask.schedule()
  }
})
watch(() => rowVirtualizer.value.scrollOffset, () => {
  rangeOverride.value = undefined
  scrollTask.schedule()
})
watch([totalHeight, viewport.height], () => contentTask.schedule())
watch(rows, () => {
  cleared.value = false
  rangeOverride.value = undefined
  if (!props.fetchMore) {
    estimateOverride.value = undefined
    rerender(true)
  }
})

function rerender(noEmit = false, resetHeights = true) {
  if (disposed) {
    return
  }
  cleared.value = false
  rangeOverride.value = undefined
  if (resetHeights) {
    rowVirtualizer.value.measure()
  }
  nextTick(() => {
    if (!disposed) {
      contentEl.value?.querySelectorAll<HTMLDivElement>(':scope > [data-index]').forEach(element => rowVirtualizer.value.measureElement(element))
      if (!noEmit) {
        scrollTask.schedule()
      }
    }
  })
}

function clear(options?: { rowHeight?: number }) {
  if (!disposed) {
    estimateOverride.value = options?.rowHeight
    cleared.value = true
    rangeOverride.value = undefined
    rowVirtualizer.value.measure()
  }
}

function renderOnlyVisible(alsoRerender = false, options: { firstIdx?: number, lastIdx?: number, rowHeight?: number } = {}) {
  if (disposed) {
    return { rows: [], firstRow: null, lastRow: null }
  }
  cleared.value = false
  const virtualizer = rowVirtualizer.value
  if (alsoRerender) {
    virtualizer.measure()
  }
  const range = virtualizer.calculateRange()
  const first = Math.max(0, Math.min(options.firstIdx ?? range?.startIndex ?? 0, rows.value.length))
  const end = options.rowHeight ? first + Math.ceil(viewport.height.value / options.rowHeight) - 1 : range?.endIndex ?? first
  const last = Math.min(options.lastIdx ?? end, rows.value.length - 1)
  rangeOverride.value = { first, last }
  const rendered = virtualizer.measurementsCache.slice(first, last + 1).map(item => ({
    ref: rows.value[item.index],
    id: item.key,
    idx: item.index,
    style: { '--translateY': item.start - scrollMargin.value },
  }))

  return { rows: rendered, firstRow: rendered[0] ?? null, lastRow: rendered.at(-1) ?? null }
}

function updateRowHeight(element: HTMLDivElement) {
  if (!disposed && element?.isConnected && element.parentElement === contentEl.value) {
    rowVirtualizer.value.measureElement(element)
  }
}

function scrollTo(index: number) {
  if (!disposed && rows.value.length) {
    rangeOverride.value = undefined
    rowVirtualizer.value.scrollToIndex(Math.max(0, Math.min(index, rows.value.length - 1)), { align: 'start' })
  }
}

const rowClass = computed(() => mergedProps.value.ui?.rowClass?.({ defaults: VIRTUAL_SCROLLER_VERTICAL_DEFAULT_PROPS.ui.rowClass() }))
const rowStyle = computed(() => mergedProps.value.ui?.rowStyle?.())
const slotStyle = computed(() => ({ minHeight: `${props.rowHeight}px` }))

defineExpose({
  element: containerEl,
  scrollToTop: () => scrollTo(0),
  scrollToBottom: () => {
    if (!disposed && rows.value.length) {
      rangeOverride.value = undefined
      rowVirtualizer.value.scrollToIndex(rows.value.length - 1, { align: 'end' })
    }
  },
  scrollTo,
  focus: () => containerEl.value?.focus(),
  rerender,
  clear,
  triggerScrollEvent: emitVirtualScrollEvent,
  renderOnlyVisible,
  updateRowHeight,
  getDimensions: () => ({
    virtualScroll: containerEl.value ? getRect(containerEl.value) : undefined,
    container: contentEl.value ? getRect(contentEl.value) : undefined,
  }),
})
onMounted(() => {
  isMounted.value = true
  contentTask.schedule()
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
        v-for="virtualRow in renderedVirtualRows"
        :key="(virtualRow.key as PropertyKey)"
      >
        <div
          :ref="measureElement"
          :data-index="virtualRow.index"
          :data-idx="virtualRow.index"
          :data-key="virtualRow.key"
          class="virtual-scroll__row content-row"
          :class="[
            rowClass,
            {
              'is-sticky': virtualRow.isSticky,
              'is-sticky-active': virtualRow.isActiveSticky,
            },
          ]"
          :style="{
            ...rowStyle,
            ...(rowHeight && { minHeight: `${rowHeight}px` }),
            ...virtualRow.positionStyle,
            'top': 0,
            'left': 0,
            'display': 'flex',
            '--rowHeight': virtualRow.size,
          }"
        >
          <!-- Content -->
          <slot
            :row="rows[virtualRow.index]!"
            :index="virtualRow.index"
            :is-sticky="virtualRow.isSticky"
            :is-active-sticky="virtualRow.isActiveSticky"
            :style="slotStyle"
          />
        </div>
      </template>

      <slot name="inner-content" />
    </div>

    <slot name="inner" />
  </div>
</template>

<style lang="scss" scoped>
.virtual-scroll {
  @apply relative overflow-auto outline-none;
}

.virtual-scroll__content {
  @apply relative;
}

.virtual-scroll__content .virtual-scroll__row {
  @apply w-full;

  &:not(.is-sticky-active) {
    transform: translateY(calc(var(--translateY) * 1px));
  }
}

.virtual-scroll__content .virtual-scroll__row.is-sticky {
  @apply z-1;
}
</style>

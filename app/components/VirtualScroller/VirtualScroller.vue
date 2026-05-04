<script setup lang="ts" generic="T">
import type { CSSProperties } from 'vue'

// Types
import type { IVirtualScrollEvent } from './types/virtual-scroll-event.type'
import type { IVirtualScrollerProps } from './types/virtual-scroller-props.type'

// Functions
import { getElementSize } from '#layers/utilities/app/functions/get-element-size'

// Constants
import { VIRTUAL_SCROLLER_DEFAULT_PROPS } from './constants/virtual-scroller-default-props'

type IRow = {
  ref: T
  id: string | number
  idx: number
  style: CSSProperties
}

type IVisibleRows = {
  rows: IRow[]
  firstRow: IRow | null
  lastRow: IRow | null
}

type IProps<T> = IVirtualScrollerProps<T> & {
  columns?: TableColumn<T>[]
}

const props = withDefaults(defineProps<IProps<T>>(), {
  ...getComponentProps('virtualScroller'),
})

const emits = defineEmits<{
  (e: 'change:contentSize', payload: { height: number, width: number }): void
  (e: 'virtualScroll', payload: IVirtualScrollEvent): void
}>()

defineSlots<{
  'inner'?: () => any
  'inner-content'?: () => any
  'default': (props: {
    row: T
    index: number
    columns?: TableColumn<T>[]
    style: CSSProperties
  }) => any
}>()

defineExpose({
  scrollToTop: () => scrollTo(0),
  scrollToBottom,
  scrollTo,
  focus: () => virtualScrollEl.value?.focus(),
  rerender: (noEmit = false, resetHeights = true) => {
    rerenderVisibleRows({ triggerScrollEvent: !noEmit, resetHeights })
  },

  /**
   * Clears the virtual scroller = removes the rendered rows and resets the heights
   *
   * You can also pass a `rowHeight` to reset the heights to a specific value
   */
  clear: (payload?: { rowHeight?: number }) => {
    const { rowHeight } = payload ?? {}

    heights.value = Array.from({ length: props.rows?.length ?? 0 }).fill(rowHeight ?? props.rowHeight) as number[]
    renderedRows.value = { rows: [], firstRow: null, lastRow: null }
  },

  /**
   * Triggers the scroll event
   */
  triggerScrollEvent: () => {
    handleScrollEvent(lastScrollEvent.value, { noEmit: false, force: true })
  },

  /**
   * Rerenders the visible rows
   */
  renderOnlyVisible,
  updateRowHeight,
  getDimensions: () => ({
    virtualScroll: virtualScrollerRect,
    container: containerRect,
  }),
})

// Utils
const { isDesktopOrTablet } = useDevice()
const lastScrollEvent = ref<Event>()
const preventNextScroll = refAutoReset(false, 50)
let lastScrollTop = 0

const mergedProps = computed(() => {
  return getComponentMergedProps('virtualScroller', props)
})

function getRowKey(row?: T) {
  return String(row?.[rowKey.value] || '')
}

// Constants
const VIRTUAL_SCROLL_THRESHOLD = props.threshold
const OVERSCAN_PX = { top: 400, bottom: 800 }
const INITIAL_ROWS_RENDER_COUNT = props.initialRowsRenderCount
  ?? (isDesktopOrTablet
    ? Math.ceil(2160 / props.rowHeight)
    : Math.ceil(1080 / props.rowHeight))

// Layout
const rows = toRef(props, 'rows')
const columns = toRef(props, 'columns')
const containerEl = useTemplateRef('containerEl')
const virtualScrollEl = useTemplateRef('virtualScrollEl')
const isMounted = ref(false)
const rowHeight = toRef(props, 'rowHeight')
const rowKey = toRef(props, 'rowKey') as Ref<keyof T>
const visibleItemsIdx = ref({ first: 0, last: 0 })

const isVirtual = computed(() => {
  return (props.rows ?? []).length > VIRTUAL_SCROLL_THRESHOLD || false
})

const rowClass = computed(() => {
  return props.ui?.rowClass?.({ defaults: VIRTUAL_SCROLLER_DEFAULT_PROPS.ui.rowClass() })
})

const rowStyle = computed(() => {
  return props.ui?.rowStyle?.()
})

const containerRect = useElementSize(containerEl)
const virtualScrollerRect = useElementSize(virtualScrollEl)

watch([containerRect.height, containerRect.width], ([height, width]) => {
  const { extra } = getElementSize(
    unrefElement(virtualScrollEl.value!) as HTMLElement,
    { includeBorder: true, includePadding: true, includeMargin: true },
  )

  emits('change:contentSize', {
    height: height + extra.vertical,
    width: width + extra.horizontal,
  })
})

const overscan = computed(() => {
  return {
    top: props.overscan?.top ?? OVERSCAN_PX.top,
    bottom: props.overscan?.bottom ?? OVERSCAN_PX.bottom,
  }
})

const heights = ref<number[]>(
  Array.from({ length: props.rows?.length ?? 0 }).fill(props.rowHeight) as number[],
)

const heightsCumulated = computed(() => {
  let height = 0

  return heights.value.map(h => {
    height += h

    return height
  })
})

const renderedRows = ref(
  getRenderedRows(0, INITIAL_ROWS_RENDER_COUNT),
) as Ref<IVisibleRows>

const avgRowHeight = useAverage(heights)

const renderedRowsByIdx = computed(() => {
  return renderedRows.value.rows.reduce((agg, row) => {
    agg[row.idx] = row

    return agg
  }, {} as Record<number, IRow>)
})

const { height, width } = useElementSize(virtualScrollEl)

useScroll(virtualScrollEl, {
  onScroll(ev) {
    pauseRowHeightWatcher()
    handleScrollEvent(ev)

    lastScrollEvent.value = ev
  },
  onStop: () => {
    nextTick(resumeRowHeightWatcher)
  },
})

const virtualScrollStyle = computed(() => {
  return { '--defaultRowHeight': `${rowHeight.value}px` }
})

const containerStyle = computed<CSSProperties>(() => {
  return {
    minHeight: `${heights.value.reduce((agg, curr) => agg + curr, 0)}px`,
  }
})

const rowsInViewport = computed(() => {
  const scrollTop = (lastScrollEvent.value?.target as HTMLElement)?.scrollTop ?? 0

  const overscanBot = Math.max(
    height.value
    + overscan.value.bottom
    + Math.min(overscan.value.top, scrollTop),
    0,
  ) as number

  return Math.ceil(overscanBot / avgRowHeight.value)
})

function handleScrollEvent(
  ev?: Event,
  options?: {
    /**
     * Whether the `virtual-scroll` event should be emitted
     */
    noEmit?: boolean

    /**
     * Force the scrolling event to recalculate the visible rows
     */
    force?: boolean
  },
) {
  if (preventNextScroll.value) {
    preventNextScroll.value = false

    return
  }

  const { noEmit, force } = options ?? {}
  const _noEmit = props.noScrollEmit || noEmit
  const scrollY = ((ev?.target as any)?.scrollTop || 1) as number

  if (!force && lastScrollTop === scrollY) {
    return
  }

  lastScrollTop = scrollY

  // Rendered rows
  const overscanTop = Math.max(scrollY - overscan.value.top, 1)
  const firstIdx = isVirtual.value
    ? heightsCumulated.value.findIndex(h => h >= overscanTop)
    : 0
  const lastIdx = isVirtual.value
    ? firstIdx + rowsInViewport.value
    : rows.value?.length - 1

  renderedRows.value = getRenderedRows(firstIdx, lastIdx)

  // Visible rows
  const firstVisibleIdx = heightsCumulated.value.findIndex(h => h >= scrollY)
  let lastVisibleIdx = heightsCumulated.value.findIndex(
    h => h >= scrollY + (virtualScrollerRect.height.value),
  )

  lastVisibleIdx = lastVisibleIdx === -1 ? rows.value?.length - 1 : lastVisibleIdx

  const firstVisibleItem = props.rows![firstVisibleIdx]
  const lastVisibleItem = props.rows![lastVisibleIdx]

  visibleItemsIdx.value.first = firstVisibleIdx
  visibleItemsIdx.value.last = lastVisibleIdx

  if (!_noEmit) {
    emits('virtualScroll', {
      visibleStartItem: {
        index: firstVisibleIdx,
        key: getRowKey(firstVisibleItem),
        size: heights.value[firstVisibleIdx] ?? props.rowHeight,
      },
      visibleEndItem: {
        index: lastVisibleIdx,
        key: getRowKey(lastVisibleItem),
        size: heights.value[lastVisibleIdx] ?? props.rowHeight,
      },
    })
  }
}

function updateRowHeight(el: HTMLElement) {
  if (!el) {
    return
  }

  const idx = Number(el.dataset.idx)
  const currentHeight = Number(el?.style.getPropertyValue('--rowHeight') ?? 0)
  handleMountedRow(el, { resetHeights: true })

  nextTick(() => {
    const newHeight = el?.clientHeight ?? 0
    const diff = newHeight - currentHeight

    // We need to update every row that is affected by the change, so basically
    // every row that succeeds the current one
    if (diff) {
      for (let i = idx + 1; i < renderedRows.value.rows.length; i++) {
        const rowKey = renderedRows.value.rows[i]!.id
        const el = document.querySelector(`[data-key="${String(rowKey)}"]`)

        heights.value[i]! += diff
        handleMountedRow(el)
      }
    }
  })
}

// Gets the rows that should be rendered
function getRenderedRows(firstIdx: number, lastIdx: number): IVisibleRows {
  if (!props.rows?.length) {
    return {
      rows: [] as IRow[],
      firstRow: null,
      lastRow: null,
    }
  }

  const translateYBase = heightsCumulated.value[firstIdx - 1] ?? 0
  const _lastIdx = Math.min(lastIdx, props.rows.length - 1)

  let preceedingRowsHeight = 0

  const rows: IRow[] = props.rows
    .slice(firstIdx, _lastIdx + 1)
    .map((row, idx) => {
      const rowKey = Array.isArray(row)
        ? get(row[0], props.rowKey)
        : get(row, props.rowKey)

      const rowObj = {
        ref: row,
        idx: firstIdx + idx,
        id: rowKey,
        style: { '--translateY': preceedingRowsHeight + translateYBase },
      }

      preceedingRowsHeight += (heights.value[firstIdx + idx] ?? 0)

      return rowObj
    })

  const firstRow = rows[0] as IRow
  const lastRow = rows[rows.length - 1] as IRow

  return { rows, firstRow, lastRow }
}

/**
 * Scrolls to the row at the given index
 * NOTE - Be aware that this might not work properly if the row heights are not
 * all the same height
 */
function scrollTo(idx: number) {
  const scrollY = idx * rowHeight.value

  virtualScrollEl.value?.scrollTo({ top: scrollY })
}

/**
 * Scrolls to the bottom of the virtual scroller
 */
function scrollToBottom(payload?: {
  /**
   * When make sure is true, it will check the scroll position in the next
   * animation frame and repeat the process until the scroll position is at the bottom
   */
  makeSure?: boolean
}) {
  const { makeSure = false } = payload ?? {}

  if (!virtualScrollEl.value) {
    return
  }

  const { scrollTop, scrollHeight, clientHeight } = virtualScrollEl.value

  if (virtualScrollEl.value) {
    virtualScrollEl.value.scrollTop = scrollHeight

    if (makeSure) {
      requestAnimationFrame(() => {
        const diff = scrollTop - (scrollHeight - clientHeight)

        if (Math.abs(diff) >= 1) {
          scrollToBottom()
        }
      })
    }
  }
}

// When row is mounted, we update the height for that specific row
async function handleMountedRow(node: any, options?: { resetHeights?: boolean }) {
  const { resetHeights } = options ?? {}

  const el = ('el' in node ? node.el : node) as HTMLElement
  const idx = Number(el.dataset.idx)

  if (resetHeights) {
    el.style.setProperty('--rowHeight', String(props.rowHeight))
  }

  if (heights.value[idx] !== el.clientHeight) {
    heights.value[idx] = Math.max(props.rowHeight, el.clientHeight)
  }

  const _row = renderedRowsByIdx.value[idx] as IRow

  nextTick(() => {
    if (_row) {
      const translateY = heightsCumulated.value[idx - 1] ?? 0
      const rowHeight = Math.max(props.rowHeight, el.clientHeight)

      // el.style.setProperty('--translateY', String(translateY))
      el.style.setProperty('--rowHeight', String(rowHeight))
      _row.style['--translateY'] = String(translateY)
    }
  })
}

function rerenderVisibleRows(payload?: {
  triggerScrollEvent?: boolean
  emitScrollEvent?: boolean
  resetHeights?: boolean
}) {
  const { triggerScrollEvent = true, emitScrollEvent, resetHeights } = payload ?? {}
  const children = Array.from(containerEl.value?.children || [])

  children?.forEach(el => {
    handleMountedRow(el, { resetHeights })
  })

  if (triggerScrollEvent) {
    handleScrollEvent(lastScrollEvent.value, { noEmit: !emitScrollEvent, force: true })
  }
}

watchThrottled(
  width,
  () => {
    if (!isVirtual.value) {
      return
    }

    pauseRowHeightWatcher()
    rerenderVisibleRows({
      triggerScrollEvent: true,
      emitScrollEvent: false,
      resetHeights: true,
    })

    nextTick(resumeRowHeightWatcher)
  },
  {
    throttle: 150,
    leading: true,
    trailing: true,
  },
)

watch(rows, (rows, rowsOld) => {
  pauseRowHeightWatcher()

  // When fetching more data, we just want to extend the heights array with
  // the default heights -> they will be recalculated when the rows are mounted
  if (props.fetchMore) {
    const newRowsCount = (rows.length ?? 0) - (rowsOld.length ?? 0)
    const newHeights = Array.from({ length: newRowsCount }).fill(props.rowHeight)

    heights.value = [...heights.value, ...newHeights] as number[]

    nextTick(() => {
      rerenderVisibleRows({ triggerScrollEvent: true, emitScrollEvent: false })
    })
  }

  // Otherwise we want to recalculate the heights - basically reinitialize the component
  else {
    heights.value = Array.from({ length: rows.length ?? 0 }).fill(props.rowHeight) as number[]

    renderedRows.value = getRenderedRows(0, INITIAL_ROWS_RENDER_COUNT)

    nextTick(() => {
      rerenderVisibleRows({ triggerScrollEvent: true, emitScrollEvent: false, resetHeights: true })
    })
  }

  setTimeout(() => {
    resumeRowHeightWatcher()
  })
})

// We check for the same height of the `content` and `scroller`
// If they are the same or the container is smaller than the scroller,
// it means we loaded the full content but it doesn't overflow
//
// If that happens, we can assume either
// - We loaded all the data
// - The data is not enough to overflow the container, so we need to force the scroll event to possibly load more data
watch([containerRect.height, virtualScrollerRect.height], async heights => {
  const isZero = heights.includes(0)
  const hasNoOverflow = heights[0] <= heights[1]

  if (hasNoOverflow && !isZero) {
    nextTick(() => {
      handleScrollEvent(lastScrollEvent.value, { noEmit: false, force: true })
    })
  }
})

// Height watcher for currently rendered rows
const hasJustRerendered = ref(false)

const {
  pause: pauseRowHeightWatcher,
  resume: resumeRowHeightWatcher,
} = watch(
  () => renderedRows.value.rows,
  () => {
    if (!isVirtual.value) {
      return
    }

    if (hasJustRerendered.value) {
      hasJustRerendered.value = false

      return
    }

    pauseRowHeightWatcher()

    nextTick(() => {
      rerenderVisibleRows({ triggerScrollEvent: false })
      resumeRowHeightWatcher()
    })

    hasJustRerendered.value = true
  },
  { deep: true },
)

pauseRowHeightWatcher()

// Lifecycle
onMounted(() => {
  nextTick(() => isMounted.value = true)
  setTimeout(resumeRowHeightWatcher, 0)
})

function renderOnlyVisible(
  alsoRerender?: boolean,
  options?: {
    firstIdx?: number
    lastIdx?: number
    rowHeight?: number
  },
) {
  const { firstIdx, lastIdx, rowHeight } = options ?? {}

  // Visible rows
  const firstVisibleIdx = heightsCumulated.value.findIndex(h => h >= scrollY)
  let lastVisibleIdx = heightsCumulated.value.findIndex(
    h => h >= scrollY + (virtualScrollerRect.height.value),
  )

  lastVisibleIdx = lastVisibleIdx === -1 ? rows.value?.length - 1 : lastVisibleIdx

  visibleItemsIdx.value.first = firstVisibleIdx
  visibleItemsIdx.value.last = lastVisibleIdx

  const { first, last } = visibleItemsIdx.value

  const _first = firstIdx ?? first
  let _last = lastIdx ?? last

  if (rowHeight) {
    const rowsInViewport = Math.ceil(
      (virtualScrollerRect.height.value) / (rowHeight || props.rowHeight),
    )

    _last = _first + rowsInViewport
  }

  preventNextScroll.value = true
  renderedRows.value = getRenderedRows(_first, _last)

  if (alsoRerender) {
    rerenderVisibleRows()
  }

  return renderedRows.value
}

// Styles - Container
const uiContainerClass = computed(() => {
  return {
    ...mergedProps.value?.ui?.containerClass?.({ defaults: VIRTUAL_SCROLLER_DEFAULT_PROPS.ui.containerClass() }),
    'is-virtual': isMounted.value && isVirtual.value,
  }
})

const uiContainerStyle = computed(() => {
  return {
    ...mergedProps.value?.ui?.containerStyle?.(),
    ...virtualScrollStyle.value,
  }
})

// Styles - Content
const uiContentClass = computed(() => {
  return mergedProps.value?.ui?.contentClass?.({ defaults: VIRTUAL_SCROLLER_DEFAULT_PROPS.ui.contentClass() })
})

const uiContentStyle = computed(() => {
  return {
    ...mergedProps.value?.ui?.contentStyle?.(),
    ...containerStyle.value,
  }
})
</script>

<template>
  <div
    ref="virtualScrollEl"
    class="virtual-scroll"
    :style="uiContainerStyle"
    :class="uiContainerClass"
    tabindex="0"
  >
    <div
      ref="containerEl"
      class="virtual-scroll__content"
      :style="uiContentStyle"
      :class="uiContentClass"
    >
      <div
        v-for="row in renderedRows.rows"
        :key="row.id"
        :data-idx="row.idx"
        :data-key="row.id"
        :style="{ ...rowStyle, ...row.style }"
        class="virtual-scroll__row content-row"
        :class="rowClass"
        @vue:mounted="handleMountedRow($event)"
      >
        <slot
          :row="row.ref"
          :index="row.idx"
          :columns
          :style="{ minHeight: `${rowHeight}px` }"
        >
          <div
            flex="~ center"
            min-h="$rowHeight"
            border="y-1 blue"
          >
            {{ row.ref }}
          </div>
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

.virtual-scroll__container {
  @apply relative rounded-custom;
}

.virtual-scroll__row {
  @apply flex w-full;

  transform: translate3d(var(--translate3D, 0, 0, 0));
  min-height: var(--defaultRowHeight);
  will-change: transform;
}

.virtual-scroll.is-virtual {
  .virtual-scroll__row {
    @apply absolute;

    min-height: calc(var(--rowHeight) * 1px);
    transform: translateY(calc(var(--translateY) * 1px)) translate3d(var(--translate3D, 0, 0, 0));
  }
}
</style>

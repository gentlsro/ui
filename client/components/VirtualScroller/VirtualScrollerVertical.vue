<script setup lang="ts" generic="T extends IItem = IItem">
import { getRect } from 'mezr'
import { useVirtualizer } from '@tanstack/vue-virtual'

// Types
import type { IVirtualScrollEvent } from './types/virtual-scroll-event.type'
import type { IVirtualScrollerVerticalProps } from './types/virtual-scroller-vertical-props.type'

// Functions
import { getComponentProps } from '../../functions/get-component-props'

const props = withDefaults(
  defineProps<IVirtualScrollerVerticalProps<T>>(),
  { ...getComponentProps('virtualScroller') },
)
const emits = defineEmits<{
  (e: 'virtualScroll', payload: IVirtualScrollEvent): void
  (e: 'change:contentSize', payload: { height: number }): void
}>()

// Layout
const rows = toRef(props, 'rows') as Ref<T[]>
const containerEl = useTemplateRef('containerEl')
const contentEl = useTemplateRef('contentEl')

// Row virtualizer
const rowVirtualizerOptions = computed(() => {
  return {
    count: rows.value.length,
    scrollMargin: 0,
    getScrollElement: () => containerEl.value,
    estimateSize: () => props.rowHeight ?? 28,
    getItemKey: (idx: number) => rows.value[idx]?.[props.rowKey ?? 'id'],

    ...props.virtualizerOptions,
  }
})

const rowVirtualizer = useVirtualizer(rowVirtualizerOptions as any)

const virtualRows = computed(() => {
  return rowVirtualizer.value.getVirtualItems()
})

const totalHeight = computed(() => {
  return rowVirtualizer.value.getTotalSize()
})

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
  }
})

// Virtual scrolling
const { x, y } = useScroll(containerEl)
const { height } = useElementSize(containerEl)

const virtualEdges = computed(() => {
  return {
    firstRow: virtualRows.value.at(0),
    lastRow: virtualRows.value.at(-1),
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
  [totalHeight],
  ([totalHeight]) => {
    emits('change:contentSize', { height: totalHeight })

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
            'display': 'flex',
            '--rowHeight': virtualRow.size,
            '--translateY': virtualRow.start - rowVirtualizer.options.scrollMargin,
          }"
        >
          <!-- Content -->
          <slot
            :row="rows[virtualRow.index]!"
            :index="virtualRow.index"
            :style="{ minHeight: `${rowHeight}px` }"
          />
        </div>
      </template>

      <slot name="inner" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.virtual-scroll {
  @apply relative overflow-auto outline-none;

  &__content {
    @apply relative;
  }

  &__row {
    @apply w-full;

    transform: translateY(calc(var(--translateY) * 1px));
  }
}
</style>

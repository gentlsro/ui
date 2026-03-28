<script setup lang="ts">
// Types
import type { ITableProps } from './types/table-props.type'
import type { ITableSplitter } from './types/table-splitter.type'

// Store
import { useTableStore } from './stores/table.store'
import { useTableColumnResizing } from './composables/useTableColumnResizing'

// Constants
import { TABLE_DEFAULT_PROPS } from './constants/table-default-props.constant'

type IProps = Pick<ITableProps, 'ui'>

const props = defineProps<IProps>()

// Store
const {
  headerEl,
  headerX,
  isContentVerticallyScrollable,
  visibleColumns,
  isCardView,
} = useTableStore()

// Utils
const { scrollbarWidth } = useOverflow()
const { activeSplitter, columnSplitters, handleSplitterPointerDown } = useTableColumnResizing()

const contentClass = computed(() => {
  return isCardView.value ? 'relative gap-1 m-l-1' : 'relative'
})

const headerClass = computed(() => {
  return props.ui?.headerClass?.({
    defaults: TABLE_DEFAULT_PROPS.ui.headerClass(),
  })
})

const headerStyle = computed(() => {
  return props.ui?.headerStyle?.()
})

function getSplitterLeft(splitter: ITableSplitter) {
  const { column } = splitter

  // We move the splitter by the scrollX value when the column is frozen
  const offsetX = column.semiFrozen ? headerX.value : 0

  return `${splitter.left + offsetX - 3}px`
}
</script>

<template>
  <HorizontalScroller
    ref="headerEl"
    v-model:scroll-position="headerX"
    class="table-header"
    :class="headerClass"
    :style="headerStyle"
    :ui="{ contentClass: ({ defaults }) => `${defaults.all} ${contentClass}` }"
  >
    <!-- Column cells -->
    <slot
      v-for="(col, idx) in visibleColumns"
      :key="col.field"
      :column="col"
      :ui
    >
      <TableHeaderCell
        :column="col"
        :ui
        :class="{
          'is-last': idx === visibleColumns.length - 1,
          'rounded-custom border-1': isCardView,
        }"
      />
    </slot>

    <template v-if="!isCardView">
      <!-- Filler -->
      <div
        v-if="isContentVerticallyScrollable"
        :style="{ minWidth: `${scrollbarWidth}px` }"
      />

      <!-- Splitters -->
      <!-- Active splitter -->
      <span
        v-if="activeSplitter"
        class="splitter splitter--active"
        :style="{
          left: `${activeSplitter.left - 3}px`,
          top: `${activeSplitter.top}px`,
          height: `${activeSplitter.height}px`,
        }"
      />

      <!-- Columns splitters -->
      <template v-else>
        <div
          v-for="splitter in columnSplitters"
          :key="splitter.field"
          class="splitter"
          :style="{ left: getSplitterLeft(splitter) }"
          @pointerdown.stop.prevent="handleSplitterPointerDown(splitter, $event)"
        />
      </template>
    </template>
  </HorizontalScroller>
</template>

<style scoped lang="scss">
.splitter {
  @apply absolute top-0 bottom-0 w-7px z-5;

  &--active {
    @apply fixed z-$zMax border-x-3px border-ca bg-black dark:bg-white
      cursor-col-resize;
  }

  &:hover {
    @apply border-x-3px border-ca bg-black dark:bg-white cursor-col-resize;
  }
}
</style>

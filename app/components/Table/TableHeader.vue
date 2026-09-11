<script setup lang="ts">
// Types
import type { ITableProps } from './types/table-props.type'
import type { ITableSplitter } from './types/table-splitter.type'

// Store
import { useTableStore } from './stores/table.store'
import { useTableColumnResizing } from './composables/useTableColumnResizing'

// Constants
import { TABLE_DEFAULT_PROPS } from './constants/table-default-props.constant'

type IProps = Pick<ITableProps, 'ui' | 'freeze'> & { hasRowActions?: boolean }

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

const rowActionsHeaderClass = computed(() => {
  const defaults = TABLE_DEFAULT_PROPS.ui.rowActionsHeaderClass()
  return props.ui?.rowActionsHeaderClass?.({ defaults }) ?? defaults.all
})

function getSplitterLeft(splitter: ITableSplitter) {
  const { column } = splitter

  // We move the splitter by the scrollX value when the column is frozen
  const offsetX = column.semiFrozen ? headerX.value : 0

  // The 1px center stripe must sit inside the column's right edge, like its border.
  return `${splitter.left + offsetX - 4}px`
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
          'is-last': idx === visibleColumns.length - 1 && (isCardView || !hasRowActions),
          'rounded-custom border-1': isCardView,
        }"
      />
    </slot>

    <template v-if="!isCardView">
      <!-- Match the body's action area so both scrollers have the same range. -->
      <div
        v-if="hasRowActions"
        aria-hidden="true"
        class="row-actions-header"
        :class="[rowActionsHeaderClass, { 'is-frozen': freeze?.rowActions }]"
      />
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
          left: `${activeSplitter.left - 4}px`,
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
          :class="{ 'splitter--last': splitter.column === visibleColumns[visibleColumns.length - 1] }"
          :style="{ left: getSplitterLeft(splitter) }"
          @pointerdown.stop.prevent="handleSplitterPointerDown(splitter, $event)"
        />
      </template>
    </template>
  </HorizontalScroller>
</template>

<style scoped lang="scss">
@use './styles/frozen-edge-shadow' as *;

.can-scroll-right .row-actions-header.is-frozen {
  border-left-width: 1px;
  @include frozen-edge-shadow(-1);
}

.row-actions-header {
  flex: 0 0 var(--table-row-actions-width, 5.25rem);
}

.separator--vertical .row-actions-header,
.separator--cell .row-actions-header {
  border-right-width: 1px;
}

.separator--horizontal .row-actions-header,
.separator--cell .row-actions-header {
  border-bottom-width: 1px;
}

.is-bordered .row-actions-header {
  border-width: 1px 1px 1px 0;
}

.row-actions-header.is-frozen {
  position: sticky;
  right: 0;
  z-index: 1;
}

.splitter {
  @apply absolute top-0 bottom-0 w-7px z-5;

  &--active {
    @apply fixed z-$zMax border-x-3px border-ca bg-black dark:bg-white
      cursor-col-resize;
  }

  &:hover {
    @apply border-x-3px border-ca bg-black dark:bg-white cursor-col-resize;
  }

  // Keep the final hit area inside the table without moving its visible stripe.
  &--last,
  &--last:hover {
    width: 4px;
    border-right-width: 0;
  }
}
</style>

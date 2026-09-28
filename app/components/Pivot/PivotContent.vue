<script setup lang="ts" vapor generic="T extends IItem = IItem">
// Composables
import { usePivotScrollSync } from './composables/usePivotScrollSync'

// Store
import { usePivotStore } from './stores/pivot.store'

// Constants
import { PIVOT_DEFAULT_PROPS } from './constants/pivot-default-props.constant'

const PIVOT_ROW_HEIGHT = 32
// About 5 rows, as before the switch from `VirtualScrollerVertical` (its default overscan renders ~40 extra rows)
const PIVOT_OVERSCAN = { top: PIVOT_ROW_HEIGHT * 5, bottom: PIVOT_ROW_HEIGHT * 5 }

const {
  visibleData,
  visibleStickyIndices,
  visibleValueColumns,
  displayRowFieldsTotalWidthPx,
  resolvedLeftPanelWidth,
  ui,
  hoveredIdx,
  rowsVirtualScrollEl,
  valuesVirtualScrollEl,
  rowsWrapperEl,
  valueItemUiClass,
  getRowContextLevels,
} = usePivotStore()

usePivotScrollSync()

function handleMouseEnter(index: number) {
  hoveredIdx.value = index
}

function handleMouseLeave() {
  hoveredIdx.value = undefined
}

// Styles - Content
const contentClass = computed(() => {
  return ui.value?.contentClass?.({
    defaults: PIVOT_DEFAULT_PROPS.ui.contentClass(),
  })
})

const contentStyle = computed(() => {
  return ui.value?.contentStyle?.()
})

// Styles - Values
const valuesScrollerClass = computed(() => {
  return ui.value?.valuesScrollerClass?.({
    defaults: PIVOT_DEFAULT_PROPS.ui.valuesScrollerClass(),
  })
})

// Styles - Rows
const rowsScrollerClass = computed(() => {
  return ui.value?.rowsScrollerClass?.({
    defaults: PIVOT_DEFAULT_PROPS.ui.rowsScrollerClass(),
  })
})

const rowsWrapperStyle = computed(() => {
  return { width: resolvedLeftPanelWidth.value }
})

const rowsWrapperClass = computed(() => {
  return ui.value?.rowsWrapperClass?.({
    defaults: PIVOT_DEFAULT_PROPS.ui.rowsWrapperClass(),
  })
})

const rowsScrollerStyle = computed(() => {
  return { width: `${displayRowFieldsTotalWidthPx.value}px` }
})
</script>

<template>
  <div
    class="pivot-content"
    :class="contentClass"
    :style="contentStyle"
  >
    <!-- Row items -->
    <div
      ref="rowsWrapperEl"
      :class="rowsWrapperClass"
      :style="rowsWrapperStyle"
    >
      <VirtualScroller
        ref="rowsVirtualScrollEl"
        class="pivot-content__rows grow"
        :class="rowsScrollerClass"
        :rows="visibleData"
        row-key="id"
        :row-height="PIVOT_ROW_HEIGHT"
        :overscan="PIVOT_OVERSCAN"
        :no-scroll-emit="true"
        :sticky-indices="visibleStickyIndices"
        :style="rowsScrollerStyle"
      >
        <template #default="{ row, index, isStuck }">
          <!-- A pinned row shows the group labels of the rows scrolling by underneath it -->
          <PivotRowContext
            v-if="isStuck"
            :row
          />

          <PivotRowItem
            v-else
            :row="row"
            :class="{ 'is-odd': !(index % 2), 'is-hovered': hoveredIdx === index }"
            @mouseenter="handleMouseEnter(index)"
            @mouseleave="handleMouseLeave"
          />
        </template>
      </VirtualScroller>
    </div>

    <!-- Value items -->
    <!-- Columns are virtualized too: each row renders only the value cells in (or near) the viewport -->
    <VirtualScroller
      v-if="visibleValueColumns.length"
      ref="valuesVirtualScrollEl"
      class="pivot-content__values"
      :class="valuesScrollerClass"
      :rows="visibleData"
      row-key="id"
      :row-height="PIVOT_ROW_HEIGHT"
      :overscan="PIVOT_OVERSCAN"
      :no-scroll-emit="true"
      :sticky-indices="visibleStickyIndices"
      :columns="visibleValueColumns"
      virtualize-columns
      column-key="id"
    >
      <template #default="{ row, index, columns, isStuck }">
        <!-- The pinned row is label-only, so its value side stays blank -->
        <div
          v-if="isStuck"
          class="pivot-value-item pivot-value-context grow"
          :class="[valueItemUiClass, { invisible: !getRowContextLevels(row).length }]"
        />

        <PivotValueItem
          v-else
          :item="row.valueItem"
          :row
          :columns
          :class="{ 'is-odd': !(index % 2), 'is-hovered': hoveredIdx === index }"
          @mouseenter="handleMouseEnter(index)"
          @mouseleave="handleMouseLeave"
        />
      </template>
    </VirtualScroller>
  </div>
</template>

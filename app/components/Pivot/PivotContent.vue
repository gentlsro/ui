<script setup lang="ts" generic="T extends IItem = IItem">
// Composables
import { usePivotScrollSync } from './composables/usePivotScrollSync'

// Store
import { usePivotStore } from './stores/pivot.store'

// Constants
import { PIVOT_DEFAULT_PROPS } from './constants/pivot-default-props.constant'

const PIVOT_ROW_HEIGHT = 32

const {
  visibleData,
  visibleStickyIndices,
  visibleValueColumns,
  rows,
  ui,
  hoveredIdx,
  rowsVirtualScrollEl,
  valuesVirtualScrollEl,
  rowsWrapperEl,
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

const rowsWrapperClass = computed(() => {
  return ui.value?.rowsWrapperClass?.({
    defaults: PIVOT_DEFAULT_PROPS.ui.rowsWrapperClass(),
  })
})

const rowsScrollerStyle = computed(() => {
  const width = rows.value.reduce((agg, row) => agg + row._width, 0)

  return {
    width: `${width}px`,
  }
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
    >
      <!-- <div
        ref="rowsVirtualScrollEl"
        class="virtual-scroll"
        :class="rowsScrollerClass"
      >
        <PivotRowItem
          v-for="(row, index) in visibleData"
          :key="row.id"
          :item="row.rowItem"
          :group-ids="row.groupIds"
          :class="{ 'is-odd': !(index % 2), 'is-hovered': hoveredIdx === index }"
          @mouseenter="handleMouseEnter(index)"
          @mouseleave="handleMouseLeave"
        />
      </div> -->

      <VirtualScrollerVertical
        ref="rowsVirtualScrollEl"
        class="pivot-content__rows grow"
        :class="rowsScrollerClass"
        :rows="visibleData"
        row-key="id"
        :row-height="PIVOT_ROW_HEIGHT"
        :no-scroll-emit="true"
        :sticky-indices="visibleStickyIndices"
        :style="rowsScrollerStyle"
      >
        <template #default="{ row, index }">
          <PivotRowItem
            :item="row.rowItem"
            :group-ids="row.groupIds"
            :class="{ 'is-odd': !(index % 2), 'is-hovered': hoveredIdx === index }"
            @mouseenter="handleMouseEnter(index)"
            @mouseleave="handleMouseLeave"
          />
        </template>
      </VirtualScrollerVertical>
    </div>

    <!-- Value items -->
    <VirtualScrollerVertical
      v-if="visibleValueColumns.length"
      ref="valuesVirtualScrollEl"
      class="pivot-content__values"
      :class="valuesScrollerClass"
      :rows="visibleData"
      row-key="id"
      :row-height="PIVOT_ROW_HEIGHT"
      :no-scroll-emit="true"
      :sticky-indices="visibleStickyIndices"
    >
      <template #default="{ row, index }">
        <PivotValueItem
          :item="row.valueItem"
          :class="{ 'is-odd': !(index % 2), 'is-hovered': hoveredIdx === index }"
          @mouseenter="handleMouseEnter(index)"
          @mouseleave="handleMouseLeave"
        />
      </template>
    </VirtualScrollerVertical>
  </div>
</template>

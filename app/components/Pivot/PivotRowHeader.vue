<script setup lang="ts" generic="T extends IItem = IItem">
// Store
import { usePivotStore } from './stores/pivot.store'

// Composables
import { usePivotRowResizing } from './composables/usePivotRowResizing'

// Constants
import { PIVOT_DEFAULT_PROPS } from './constants/pivot-default-props.constant'

const { rows, rowHeaderEl, ui } = usePivotStore<T>()

const {
  activeSplitter,
  rowSplitters,
  measureRowWidths,
  handleSplitterPointerDown,
} = usePivotRowResizing<T>()

const rowHeaderClass = computed(() => {
  return ui.value?.rowHeaderClass?.({
    defaults: PIVOT_DEFAULT_PROPS.ui.rowHeaderClass(),
  })
})

const rowHeaderStyle = computed(() => {
  return ui.value?.rowHeaderStyle?.()
})

watch(
  () => rows.value.length,
  () => {
    nextTick(measureRowWidths)
  },
)

onMounted(() => {
  nextTick(measureRowWidths)
})
</script>

<template>
  <div
    ref="rowHeaderEl"
    class="pivot-row-header"
    :class="rowHeaderClass"
    :style="rowHeaderStyle"
  >
    <PivotRowHeaderCell
      v-for="row in rows"
      :key="String(row.field)"
      :row="row"
    />

    <span
      v-if="activeSplitter"
      class="splitter splitter--active"
      :style="{
        left: `${activeSplitter.left - 3}px`,
        top: `${activeSplitter.top}px`,
        height: `${activeSplitter.height}px`,
      }"
    />

    <template v-else>
      <div
        v-for="splitter in rowSplitters"
        :key="String(splitter.field)"
        class="splitter"
        :style="{ left: `${splitter.left - 3}px` }"
        @pointerdown.stop.prevent="handleSplitterPointerDown(splitter, $event)"
      />
    </template>
  </div>
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

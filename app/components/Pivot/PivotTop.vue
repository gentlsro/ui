<script setup lang="ts">
// Store
import { usePivotStore } from './stores/pivot.store'

// Constants
import { PIVOT_DEFAULT_PROPS } from './constants/pivot-default-props.constant'

const { title, ui, config, rows } = usePivotStore()

// Styles - top
const topClass = computed(() => {
  return ui.value?.topClass?.({
    defaults: PIVOT_DEFAULT_PROPS.ui.topClass(),
  })
})

const topStyle = computed(() => {
  return ui.value?.topStyle?.()
})

// Styles - title
const titleClass = computed(() => {
  return ui.value?.titleClass?.({
    defaults: PIVOT_DEFAULT_PROPS.ui.titleClass(),
  })
})

const titleStyle = computed(() => {
  const style = ui.value?.titleStyle?.()
  const width = config.value?.leftPanelWidth
    ?? `${rows.value.reduce((agg, row) => agg + row._width, 0)}px`

  return Object.assign({}, style, { width })
})
</script>

<template>
  <div
    class="pivot-top"
    :class="topClass"
    :style="topStyle"
  >
    <!-- Title -->
    <h4
      v-if="title"
      class="pivot-top__title"
      :class="titleClass"
      :style="titleStyle"
    >
      {{ title }}
    </h4>

    <!-- Filters -->
    <slot name="filters">
      <div flex="~ gap-2 items-center">
        <PivotColumnFilters />
        <PivotFilters />
      </div>
    </slot>
  </div>
</template>

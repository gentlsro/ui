<script setup lang="ts">
// Store
import { usePivotStore } from './stores/pivot.store'

// Constants
import { PIVOT_DEFAULT_PROPS } from './constants/pivot-default-props.constant'

const { title, ui, config, rows } = usePivotStore()

const isConfigurationOpen = ref(false)

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
    <!-- Left -->
    <div
      :class="titleClass"
      :style="titleStyle"
    >
      <Btn
        size="sm"
        icon="i-material-symbols:tune-rounded w-5! h-5!"
        :tooltip="{ label: $t('general.configuration') }"
      >
        <Menu
          v-model="isConfigurationOpen"
          :title="$t('general.configuration')"
          w="240"
          h="200"
          no-uplift
          placement="bottom-start"
        >
          <PivotConfiguration
            :is-open="isConfigurationOpen"
            @submit="isConfigurationOpen = false"
          />
        </Menu>
      </Btn>

      <!-- Title -->
      <h4
        v-if="title"
        class="pivot-top__title"
      >
        {{ title }}
      </h4>
    </div>

    <!-- Filters -->
    <slot name="filters">
      <div flex="~ gap-2 items-center">
        <PivotColumnFilters />
        <PivotFilters />
      </div>
    </slot>
  </div>
</template>

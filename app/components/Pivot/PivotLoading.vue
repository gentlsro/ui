<script setup lang="ts">
// Types
import type { IPivotProps } from './types/pivot-props.type'

// Store
import { usePivotStore } from './stores/pivot.store'

// Constants
import { PIVOT_DEFAULT_PROPS } from './constants/pivot-default-props.constant'

type IProps = Pick<IPivotProps, 'ui'>

const props = defineProps<IProps>()

const { isLoading } = usePivotStore()

const loadingStyle = computed(() => {
  return props.ui?.loadingStyle?.()
})

const loadingClass = computed(() => {
  return props.ui?.loadingClass?.({
    defaults: PIVOT_DEFAULT_PROPS.ui.loadingClass(),
  })
})
</script>

<template>
  <div
    v-if="isLoading"
    class="pivot-loading"
    :class="loadingClass"
    :style="loadingStyle"
  >
    <LoaderBlock size="md" />
  </div>
</template>

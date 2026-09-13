<script setup lang="ts" vapor>
// Types
import type { IPivotProps } from './types/pivot-props.type'

// Store
import { usePivotStore } from './stores/pivot.store'

// Constants
import { PIVOT_DEFAULT_PROPS } from './constants/pivot-default-props.constant'

type IProps = Pick<IPivotProps, 'ui'> & { initial?: boolean }

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
    v-if="initial || isLoading"
    class="pivot-loading"
    :class="[loadingClass, { 'is-initial': initial }]"
    role="status"
    :aria-busy="true"
    :style="loadingStyle"
  >
    <LoaderBlock :size="initial ? 'xl' : 'md'" />
  </div>
</template>

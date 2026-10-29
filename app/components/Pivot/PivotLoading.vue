<script setup lang="ts">
// Types
import type { IPivotProps } from './types/pivot-props.type'

// Store
import { usePivotStore } from './stores/pivot.store'

// Constants
import { PIVOT_LAYERED_CLASSES } from './constants/pivot-layered-classes.constant'

type IProps = Pick<IPivotProps, 'ui'>

const props = defineProps<IProps>()

const { isLoading } = usePivotStore()
const isMounted = useMounted()

const loadingStyle = computed(() => {
  return props.ui?.loadingStyle?.()
})

const loadingClass = computed(() => {
  return props.ui?.loadingClass?.({
    defaults: PIVOT_LAYERED_CLASSES.loadingClass(),
  })
})
</script>

<template>
  <div
    v-if="isMounted && isLoading"
    class="pivot-loading"
    :class="loadingClass"
    :style="loadingStyle"
  >
    <LoaderBlock size="md" />
  </div>
</template>

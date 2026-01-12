<script setup lang="ts">
// Types
import type { ICircleProgressProps } from './types/circle-progress-props.type'

// Constants
import { CIRCLE_PROGRESS_DEFAULT_PROPS } from './constants/circle-progress-default-props.constant'

const props = withDefaults(defineProps<ICircleProgressProps>(), {
  color: 'stroke-primary',
})

const mergedProps = computed(() => getComponentMergedProps('circleProgress', props))

const circlePath = computed(() => 'M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831')

// Utils
const { formatNumber } = useNumber()

// Layout
const animatedProgress = ref(0)
const size = toRef(props, 'size')

// Watch for changes in progress prop and update animatedProgress with smooth transition
watch(
  () => props.progress,
  newProgress => {
    animatedProgress.value = newProgress
  },
  { immediate: true },
)

const strokeDasharray = computed(() => `${props.progress * 100 / 100}, 100`)

// Styles - container
const containerClass = computed(() => {
  return mergedProps.value?.ui?.containerClass?.({
    defaults: CIRCLE_PROGRESS_DEFAULT_PROPS.ui.containerClass(),
  })
})

const containerStyle = computed(() => {
  return mergedProps.value?.ui?.containerStyle?.()
})

// Styles - svg
const svgClass = computed(() => {
  return mergedProps.value?.ui?.svgClass?.({
    defaults: CIRCLE_PROGRESS_DEFAULT_PROPS.ui.svgClass(),
  })
})

const svgStyle = computed(() => {
  return mergedProps.value?.ui?.svgStyle?.()
})

// Styles - circleBg
const circleBgClass = computed(() => {
  return mergedProps.value?.ui?.circleBgClass?.({
    defaults: CIRCLE_PROGRESS_DEFAULT_PROPS.ui.circleBgClass(),
  })
})

const circleBgStyle = computed(() => {
  return mergedProps.value?.ui?.circleBgStyle?.()
})

// Styles - circle
const circleClass = computed(() => {
  return mergedProps.value?.ui?.circleClass?.({
    defaults: CIRCLE_PROGRESS_DEFAULT_PROPS.ui.circleClass(),
  })
})

const circleStyle = computed(() => {
  return mergedProps.value?.ui?.circleStyle?.()
})

// Styles - text
const textClass = computed(() => {
  return mergedProps.value?.ui?.textClass?.({
    defaults: CIRCLE_PROGRESS_DEFAULT_PROPS.ui.textClass(),
  })
})

const textStyle = computed(() => {
  return mergedProps.value?.ui?.textStyle?.()
})
</script>

<template>
  <div
    class="circle-progress"
    :class="containerClass"
    :style="[{ width: `${size}px`, height: `${size}px` }, containerStyle]"
  >
    <svg
      :width="size"
      :height="size"
      viewBox="0 0 36 36"
      :class="svgClass"
      :style="svgStyle"
    >
      <path
        :d="circlePath"
        fill="none"
        stroke-width="3"
        :class="circleBgClass"
        :style="circleBgStyle"
      />
      <path
        class="circle-progress__circle"
        :stroke-dasharray="strokeDasharray"
        :d="circlePath"
        fill="none"
        stroke-width="3.1"
        :class="[color, circleClass]"
        :style="circleStyle"
      />
    </svg>

    <slot />

    <div
      v-if="!noProgressText"
      :class="textClass"
      :style="textStyle"
    >
      {{ formatNumber(progress) }}%
    </div>
  </div>
</template>

<style scoped>
.circle-progress__circle {
  transition: stroke-dasharray 0.5s ease;
}
</style>

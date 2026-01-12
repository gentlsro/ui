<script setup lang="ts">
// Types
import type { IProgressBarProps } from './types/progress-bar-props.type'

// Constants
import { PROGRESS_BAR_DEFAULT_PROPS } from './constants/progress-bar-default-props.constant'

const props = withDefaults(defineProps<IProgressBarProps>(), {
  ...getComponentProps('progressBar'),
})

// Utils
const mergedProps = computed(() => {
  return getComponentMergedProps('progressBar', props)
})

// Styles - container
const containerClass = computed(() => {
  return mergedProps.value?.ui?.containerClass?.({
    defaults: PROGRESS_BAR_DEFAULT_PROPS.ui.containerClass(),
  })
})

const containerStyle = computed(() => {
  return mergedProps.value?.ui?.containerStyle?.()
})

// Styles - inner
const innerClass = computed(() => {
  return mergedProps.value?.ui?.innerClass?.({
    defaults: PROGRESS_BAR_DEFAULT_PROPS.ui.innerClass(),
  })
})

const innerStyle = computed(() => {
  return mergedProps.value?.ui?.innerStyle?.()
})

// Styles - color
const colorClass = computed(() => {
  return mergedProps.value?.ui?.colorClass?.({
    defaults: PROGRESS_BAR_DEFAULT_PROPS.ui.colorClass(),
  })
})

const colorStyle = computed(() => {
  return mergedProps.value?.ui?.colorStyle?.()
})

// Styles - white background
const whiteBgClass = computed(() => {
  return mergedProps.value?.ui?.whiteBgClass?.({
    defaults: PROGRESS_BAR_DEFAULT_PROPS.ui.whiteBgClass(),
  })
})

const whiteBgStyle = computed(() => {
  return mergedProps.value?.ui?.whiteBgStyle?.()
})

// Styles - black background (progress)
const blackBgClass = computed(() => {
  return mergedProps.value?.ui?.blackBgClass?.({
    defaults: PROGRESS_BAR_DEFAULT_PROPS.ui.blackBgClass(),
  })
})

const blackBgStyle = computed(() => {
  return mergedProps.value?.ui?.blackBgStyle?.()
})

// Styles - text
const textClass = computed(() => {
  return mergedProps.value?.ui?.textClass?.({
    defaults: PROGRESS_BAR_DEFAULT_PROPS.ui.textClass(),
  })
})

const textStyle = computed(() => {
  return mergedProps.value?.ui?.textStyle?.()
})
</script>

<template>
  <div
    class="progress-bar"
    :class="containerClass"
    :style="[containerStyle, { '--progress': progress ?? 0 }]"
  >
    <div
      class="progress-bar__inner progress-bar__white"
      :class="[innerClass, whiteBgClass]"
      :style="[innerStyle, whiteBgStyle]"
    />
    <div
      class="progress-bar__inner progress-bar__black"
      :class="[innerClass, blackBgClass]"
      :style="[innerStyle, blackBgStyle, { width: `calc(var(--progress) * 1%)` }]"
    />
    <div
      class="progress-bar__inner progress-bar__color"
      :class="[innerClass, colorClass]"
      :style="[innerStyle, colorStyle]"
    />

    <span
      class="progress-bar__text"
      :class="textClass"
      :style="textStyle"
    >
      {{ typeof label === 'function' ? label(progress) : label }}
    </span>
  </div>
</template>

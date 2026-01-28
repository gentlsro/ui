<script setup lang="ts">
// Types
import type { ISectionProps } from './types/section-props.type'

// Constants
import { SECTION_DEFAULT_PROPS } from './constants/section-default-props.constant'

// Components
import Heading from '../Typography/Heading.vue'

const props = withDefaults(defineProps<ISectionProps>(), {
  ...getComponentProps('section'),
})

// Utils
const mergedProps = computed(() => {
  return getComponentMergedProps('section', props)
})

// Layout
const titleElement = computed(() => {
  return props?.titleElement
    ? { component: props.titleElement, props: {} }
    : { component: markRaw(Heading), props: props.headingProps }
})

const classes = computed(() => {
  return [
    {
      'is-dense': props.dense,
    },
  ]
})

// Styles - container
const containerClass = computed(() => {
  return mergedProps.value?.ui?.containerClass?.({
    defaults: SECTION_DEFAULT_PROPS.ui.containerClass(),
  })
})

const containerStyle = computed(() => {
  return mergedProps.value?.ui?.containerStyle?.()
})

// Styles - title
const titleClass = computed(() => {
  return mergedProps.value?.ui?.titleClass?.({
    defaults: SECTION_DEFAULT_PROPS.ui.titleClass(),
  })
})

const titleStyle = computed(() => {
  return mergedProps.value?.ui?.titleStyle?.()
})

// Styles - subtitle
const subtitleClass = computed(() => {
  return mergedProps.value?.ui?.subtitleClass?.({
    defaults: SECTION_DEFAULT_PROPS.ui.subtitleClass(),
  })
})

const subtitleStyle = computed(() => {
  return mergedProps.value?.ui?.subtitleStyle?.()
})

// Styles - content
const contentClass = computed(() => {
  return mergedProps.value?.ui?.contentClass?.({
    defaults: SECTION_DEFAULT_PROPS.ui.contentClass(),
  })
})

const contentStyle = computed(() => {
  return mergedProps.value?.ui?.contentStyle?.()
})
</script>

<template>
  <section
    class="section group/section"
    :class="[classes, containerClass]"
    :style="containerStyle"
  >
    <!-- Title -->
    <slot
      v-if="$slots.title || title"
      name="title"
      :ui="mergedProps.ui"
      :title-class
      :title-style
    >
      <Component
        :is="Heading"
        v-bind="titleElement.props"
        class="section__title"
        :class="titleClass"
        :style="titleStyle"
      >
        {{ title }}
      </Component>
    </slot>

    <!-- Subtitle -->
    <slot
      v-if="$slots.subtitle || subtitle"
      name="subtitle"
      :ui="mergedProps.ui"
      :subtitle-class
      :subtitle-style
    >
      <p
        class="section__subtitle"
        :class="subtitleClass"
        :style="subtitleStyle"
      >
        {{ subtitle }}
      </p>
    </slot>

    <!-- Content -->
    <div
      class="section__content"
      :class="contentClass"
      :style="contentStyle"
    >
      <slot />
    </div>
  </section>
</template>

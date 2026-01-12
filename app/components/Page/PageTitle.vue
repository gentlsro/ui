<script setup lang="ts">
// Types
import type { IPageTitleProps } from './types/page-title-props.type'

// Constants
import { PAGE_TITLE_DEFAULT_PROPS } from './constants/page-title-default-props.constant'

const props = withDefaults(defineProps<IPageTitleProps>(), {
  ...getComponentProps('pageTitle'),
})
const slots = useSlots()

// Utils
const mergedProps = computed(() => {
  return getComponentMergedProps('pageTitle', props)
})

// Layout
const hasContent = computed(() => {
  return (
    props.title
    || !!slots.default
    || !!slots.left
    || !!slots.right
    || !!slots.below
    || !!slots.prepend
    || !!slots.append
  )
})

const title = computed(() => {
  if (!props.title) {
    return
  }

  if (typeof props.title === 'function') {
    return props.title()
  } else {
    return props.title
  }
})

// Styles - container
const containerClass = computed(() => {
  return mergedProps.value?.ui?.containerClass?.({
    defaults: PAGE_TITLE_DEFAULT_PROPS.ui.containerClass(),
  })
})

const containerStyle = computed(() => {
  return mergedProps.value?.ui?.containerStyle?.()
})

// Styles - pageTitle
const pageTitleClass = computed(() => {
  return mergedProps.value?.ui?.pageTitleClass?.({
    defaults: PAGE_TITLE_DEFAULT_PROPS.ui.pageTitleClass(),
  })
})

const pageTitleStyle = computed(() => {
  return mergedProps.value?.ui?.pageTitleStyle?.()
})

// Styles - title
const titleClass = computed(() => {
  return mergedProps.value?.ui?.titleClass?.({
    defaults: PAGE_TITLE_DEFAULT_PROPS.ui.titleClass(),
  })
})

const titleStyle = computed(() => {
  return mergedProps.value?.ui?.titleStyle?.()
})
</script>

<template>
  <div
    v-if="hasContent"
    class="page-title__wrapper"
    :class="containerClass"
    :style="containerStyle"
  >
    <div
      class="page-title"
      :class="pageTitleClass"
      :style="pageTitleStyle"
    >
      <slot name="left" />

      <h4
        class="page-title__text"
        :class="titleClass"
        :style="titleStyle"
      >
        <slot name="prepend" />

        <slot>
          {{ title }}
        </slot>

        <slot name="append" />
      </h4>

      <slot name="right" />
    </div>

    <slot name="below" />
  </div>
</template>

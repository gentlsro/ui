<script setup lang="ts">
// Types
import type { IPageTitleProps } from './types/page-title-props.type'

// Functions
import { getComponentMergedProps, getComponentProps } from '../../functions/get-component-props'

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
</script>

<template>
  <div
    v-if="hasContent"
    class="page-title__wrapper"
    :class="mergedProps.ui?.containerClass"
    :style="mergedProps.ui?.containerStyle"
  >
    <div class="page-title">
      <slot name="left" />

      <h4
        class="page-title__text"
        :class="mergedProps.ui?.titleClass"
        :style="mergedProps.ui?.titleStyle"
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

<style lang="scss" scoped>
.page-title {
  @apply flex gap-2;

  &__wrapper {
    @apply flex flex-col gap-6;
  }

  &__text {
    @apply grow m-b-0;
  }
}
</style>

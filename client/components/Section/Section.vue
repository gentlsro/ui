<script setup lang="ts">
// Types
import type { ISectionProps } from './types/section-props.type'

// Functions
import { getComponentMergedProps, getComponentProps } from '../../functions/get-component-props'

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
</script>

<template>
  <section
    class="section"
    :class="[mergedProps.ui?.sectionClass, { 'is-dense': props.dense }]"
    :style="mergedProps.ui?.sectionStyle"
  >
    <!-- Title -->
    <slot
      v-if="$slots.title || title"
      name="title"
      :ui="mergedProps.ui"
    >
      <Component
        :is="Heading"
        v-bind="titleElement.props"
        class="section__title"
        :class="mergedProps.ui?.titleClass"
        :style="mergedProps.ui?.titleStyle"
      >
        {{ title }}
      </Component>
    </slot>

    <!-- Subtitle -->
    <slot
      v-if="$slots.subtitle || subtitle"
      name="subtitle"
      :ui="mergedProps.ui"
    >
      <p
        class="section__subtitle"
        :class="mergedProps.ui?.subtitleClass"
        :style="mergedProps.ui?.subtitleStyle"
      >
        {{ subtitle }}
      </p>
    </slot>

    <!-- Content -->
    <div
      class="section__content"
      :class="mergedProps.ui?.contentClass"
      :style="mergedProps.ui?.contentStyle"
    >
      <slot />
    </div>
  </section>
</template>

<style scoped lang="scss">
.section {
  @apply flex flex-col;

  &.is-dense {
    @apply "!p-0";
  }

  &__title {
    @apply relative font-semibold m-b-0 p-b-0.5;
  }

  &__subtitle {
    @apply font-rem-14 font-400;
  }
}
</style>

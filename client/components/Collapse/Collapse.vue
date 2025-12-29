<script setup lang="ts">
// Types
import type { ICollapseProps } from './types/collapse-props.type'

// Functions
import { getComponentMergedProps, getComponentProps } from '../../functions/get-component-props'

// Constants
import { COLLAPSE_DEFAULT_PROPS } from './constants/collapse-default-props.constant'

const props = withDefaults(defineProps<ICollapseProps>(), {
  ...getComponentProps('collapse'),
})

defineEmits<{
  (e: 'before-show'): void
  (e: 'before-hide'): void
  (e: 'show'): void
  (e: 'hide'): void
}>()

defineSlots<{
  header?: (props: { isOpen: boolean, onClick: () => void, ui: ICollapseProps['ui'] }) => any
  content?: (props: { isOpen: boolean, ui: ICollapseProps['ui'] }) => any
  default?: () => any
}>()

const mergedProps = computed(() => {
  return getComponentMergedProps('collapse', props)
})

// Layout
const isOpen = defineModel<boolean>({ default: false })

async function handleToggle() {
  // Closing
  if (isOpen.value) {
    isOpen.value = false

    return
  }

  // Opening
  const shouldOpen = await props.beforeShowFnc?.() ?? true

  if (shouldOpen) {
    isOpen.value = true
  }
}

// Styles - Container
const containerClass = computed(() => {
  return mergedProps.value.ui?.containerClass?.({
    isOpen: isOpen.value,
    defaults: COLLAPSE_DEFAULT_PROPS.ui.containerClass({ isOpen: isOpen.value }),
  })
})

const containerStyle = computed(() => {
  return mergedProps.value.ui?.containerStyle?.({
    isOpen: isOpen.value,
  })
})
</script>

<template>
  <div
    class="collapse"
    :data-state="isOpen ? 'open' : 'closed'"
    :aria-expanded="isOpen"
    :style="{
      ...containerStyle,
      '--transitionTimingFunction': 'cubic-bezier(0.4, 0, 0.2, 1)',
      '--transitionDuration': '200ms',
    }"
    :class="containerClass"
  >
    <!-- Header -->
    <slot
      name="header"
      :is-open
      :ui="mergedProps.ui"
      :on-click="handleToggle"
    >
      <CollapseHeader
        v-if="title"
        :is-open
        :icon
        :loading
        :subtitle
        :title
        :ui="mergedProps.ui"
        @click="handleToggle"
      />
    </slot>

    <slot
      name="content"
      :ui="mergedProps.ui"
      :is-open
    >
      <CollapseContent
        :is-open
        :floating
        :no-transition
        :content-height
        :max-content-height
        :auto-adjust-height
        :no-height-calculation
        :ui="mergedProps.ui"
        @before-hide="$emit('before-hide')"
        @hide="$emit('hide')"
        @before-show="$emit('before-show')"
        @show="$emit('show')"
      >
        <slot />
      </CollapseContent>
    </slot>
  </div>
</template>

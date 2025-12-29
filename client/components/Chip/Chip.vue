<script setup lang="ts">
// Types
import type { IChipProps } from './types/chip-props.type'

// Directives
import { vRipple } from '#layers/utilities/client/directives/ripple.directive'

// Functions
import { getComponentMergedProps, getComponentProps } from '../../functions/get-component-props'

// Constants
import { CHIP_DEFAULT_PROPS } from './constants/chip-default-props.constant'

const props = withDefaults(defineProps<IChipProps>(), {
  ...getComponentProps('chip'),
})

defineEmits<{
  (e: 'remove'): void
}>()

// Utils
const mergedProps = computed(() => {
  return getComponentMergedProps('chip', props)
})

// Layout
const label = computed(() => {
  if (typeof props.label === 'function') {
    return props.label()
  }

  return props.label
})

const classes = computed(() => {
  return [
    props.hasRemove ? 'p-r-1' : 'p-r-2',
    {
      'cursor-pointer': !!props.to || !!props.ripple,
      '!overflow-visible': props.hasCopy,
      'justify-center': props.center,
    },
  ]
})

// Styles - container
const containerClass = computed(() => {
  return mergedProps.value?.ui?.containerClass?.({
    defaults: CHIP_DEFAULT_PROPS.ui.containerClass(),
  })
})

const containerStyle = computed(() => {
  return mergedProps.value?.ui?.containerStyle?.()
})

// Styles - label
const labelClass = computed(() => {
  return mergedProps.value?.ui?.labelClass?.({
    defaults: CHIP_DEFAULT_PROPS.ui.labelClass(),
  })
})

const labelStyle = computed(() => {
  return mergedProps.value?.ui?.labelStyle?.()
})
</script>

<template>
  <div
    v-ripple="!to && ripple"
    class="chip"
    :class="[classes, containerClass]"
    :style="containerStyle"
  >
    <div
      v-if="icon"
      :class="icon"
    />

    <CopyBtn
      v-if="hasCopy"
      :model-value="label"
      size="auto"
      color="ca"
      h="4"
      w="4"
      m="x-1"
      position="bottom"
    />

    <!-- <div
      v-if="!isNil(label) || $slots.default"
      class="chip-label"
      :class="[labelClass, { 'justify-center': center }]"
      :style="labelStyle"
    > -->
    <slot>
      <NuxtLink
        v-if="to"
        v-bind="navigateToOptions"
        :to
        class="link"
        :class="labelClass"
        :style="labelStyle"
        data-onboarding="chip-label"
      >
        {{ label }}
      </NuxtLink>

      <span
        v-else
        :class="labelClass"
        :style="labelStyle"
        data-onboarding="chip-label"
      >
        {{ label }}
      </span>
    </slot>
    <!-- </div> -->

    <!-- Tooltip -->
    <Tooltip
      v-if="tooltip || $slots.tooltip"
      :offset="8"
      :content="{ title: tooltip?.label }"
      v-bind="mergedProps.tooltip?.props"
    />

    <!-- Remove btn -->
    <Btn
      v-if="hasRemove"
      v-bind="mergedProps.removeBtn"
      tabindex="-1"
      @click.stop.prevent="$emit('remove')"
      @mousedown.stop.prevent
    />
  </div>
</template>

<style lang="scss" scoped>
.chip {
  &-label {
    @apply flex gap-x-2 flex-1 truncate;
  }
}
</style>

<script setup lang="ts">
// Types
import type { IChipProps } from './types/chip-props.type'

// Directives
import { vRipple } from '$utilsLayer/client/directives/ripple.directive'

// Functions
import { getComponentMergedProps, getComponentProps } from '../../functions/get-component-props'

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
    },
  ]
})
</script>

<template>
  <div
    v-ripple="!to && ripple"
    class="chip"
    border="ca"
    h="5"
    :class="classes"
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

    <div
      v-if="label || $slots.default"
      class="chip-label"
      :class="[labelClass, { 'justify-center': center }]"
    >
      <slot>
        <NuxtLink
          v-if="to"
          v-bind="navigateToOptions"
          :to
          class="link"
          truncate
          data-onboarding="chip-label"
        >
          {{ label }}
        </NuxtLink>

        <span
          v-else
          truncate
          data-onboarding="chip-label"
        >
          {{ label }}
        </span>
      </slot>
    </div>

    <!-- Tooltip -->
    <Tooltip
      v-if="tooltip || $slots.tooltip"
      :offset="8"
      :class="mergedProps.ui?.tooltipClass"
      :style="mergedProps.ui?.tooltipStyle"
      v-bind="tooltip?.props"
    />

    <!-- Remove btn -->
    <Btn
      v-if="hasRemove"
      icon="i-eva:close-fill !w-4 !h-4"
      size="auto"
      tabindex="-1"
      @click.stop.prevent="$emit('remove')"
      @mousedown.stop.prevent
    />
  </div>
</template>

<style lang="scss" scoped>
.chip {
  @apply flex gap-2 p-y-3px p-l-2 border-px rounded-custom truncate relative
    leading-tight items-center self-center font-rem-14;

  &-label {
    @apply flex flex-gap-x-2 flex-1 truncate;
  }

  .remove-btn {
    @apply color-ca h-4 w-4 self-center shrink-0;
  }
}
</style>

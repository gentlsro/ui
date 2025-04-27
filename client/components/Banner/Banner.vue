<script setup lang="ts">
// Parent component should handle `dismiss` event and remove Banner from the DOM

// Types
import type { IBannerProps } from './types/banner-props.type'

// Functions
import { getComponentMergedProps, getComponentProps } from '../../functions/get-component-props'

const props = withDefaults(defineProps<IBannerProps>(), {
  ...getComponentProps('banner'),
})

defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'dismiss'): void
}>()

defineExpose({ dismiss })

// Utils
const mergedProps = computed(() => {
  return getComponentMergedProps('banner', props)
})

// Layout
const counter = toRef(props, 'counter')
const model = defineModel<boolean>({ default: true })

const icon = computed(() => {
  switch (props.variant) {
    case 'warning':
      return 'i-fluent:warning-16-filled h-6 w-6'
    case 'info':
      return 'i-proicons:info h-6 w-6'
    case 'success':
      return 'i-akar-icons:circle-check-fill h-6 w-6'
    case 'error':
      return 'i-ci:error h-6 w-6'
    default:
      return 'i-proicons:info h-6 w-6'
  }
})

function dismiss() {
  if (props.dismissable) {
    model.value = false
  }
}

// Counter
const counterEl = useTemplateRef('counterEl')

function bounce() {
  const _counterEl = counterEl.value as HTMLElement

  _counterEl?.addEventListener('animationend', () => {
    _counterEl.classList.remove('bounce')
  })
  _counterEl?.classList.add('bounce')
}

watch(counter, bounce)
</script>

<template>
  <Transition
    appear
    :css="!noTransition"
    @after-leave="$emit('dismiss')"
  >
    <div
      v-if="model"
      class="banner"
      :class="[
        `banner--${variant}`,
        { 'is-outlined': outlined },
        { 'is-dismissable': dismissable },
      ]"
      @click="dismiss"
    >
      <!-- Icon -->
      <div
        class="banner-icon"
        :class="{ 'self-start m-t-2': !iconCenter }"
      >
        <div :class="[iconClass, icon]" />
      </div>

      <!-- Text -->
      <div
        class="banner-text"
        :class="mergedProps.ui?.labelClass"
        :style="mergedProps.ui?.labelStyle"
      >
        <slot>
          {{ label }}
        </slot>
      </div>

      <!-- Counter -->
      <span
        v-if="counter && counter > 1"
        ref="counterEl"
        class="banner-counter"
      >
        {{ counter }}
      </span>
    </div>
  </Transition>
</template>

<style lang="scss" scoped>
.banner {
  @apply flex flex-gap-x-2 items-center rounded-custom p-x-2 relative color-true-gray;

  &-icon {
    @apply flex shrink-0;
  }

  &-text {
    @apply flex-grow p-y-2 p-r-2;
  }

  &.is-dismissable {
    @apply cursor-pointer;
  }

  &-counter {
    @apply absolute flex flex-center top--2 right--2 bg-inherit color-inherit
     rounded-2 border-current border-2 text-sm p-x-1 h-5.5 min-w-6 z-1;
  }

  &--warning {
    @apply bg-warning color-white;
  }

  &--error {
    @apply bg-negative color-white;
  }

  &--success {
    @apply bg-positive color-white;
  }

  &--info {
    @apply bg-info color-white;
  }
}

.is-outlined.banner {
  @apply bg-inherit border-true-gray color-true-gray border-2;

  .banner-counter {
    @apply dark:bg-darker bg-white;
  }

  &--warning {
    @apply color-warning border-warning bg-warning/15;
  }

  &--error {
    @apply color-negative border-negative bg-negative/15;
  }

  &--success {
    @apply color-positive border-positive bg-positive/15;
  }

  &--info {
    @apply color-info border-info bg-info/15;
  }
}

// Transition
.v-enter-active,
.v-leave-active {
  transition: all 0.25s ease;
}

.v-enter-from {
  @apply opacity-0 scale-0;
}

.v-leave-to {
  @apply opacity-0 translate-x--100%;
}

// Bounce
.bounce {
  animation: myBounce 100ms ease-in-out 0s 2 alternate forwards;
}

@keyframes myBounce {
  0% {
    transform: scale(1);
  }

  100% {
    transform: scale(1.25);
  }
}
</style>

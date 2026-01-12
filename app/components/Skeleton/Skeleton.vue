<script setup lang="ts">
// Types
import type { ISkeletonProps } from './types/skeleton-props.type'

// Constants
import { SKELETON_DEFAULT_PROPS } from './constants/skeleton-default-props.constant'

const props = withDefaults(defineProps<ISkeletonProps>(), {
  ...getComponentProps('skeleton'),
})

// Utils
const mergedProps = computed(() => {
  return getComponentMergedProps('skeleton', props)
})

// Styles - container
const containerClass = computed(() => {
  return mergedProps.value?.ui?.containerClass?.({
    defaults: SKELETON_DEFAULT_PROPS.ui.containerClass(),
  })
})

const containerStyle = computed(() => {
  return mergedProps.value?.ui?.containerStyle?.()
})
</script>

<template>
  <div
    class="skeleton"
    :class="[`variant--${variant}`, containerClass]"
    :style="[{ '--animation-speed': `${animationSpeed}ms` }, containerStyle]"
  />
</template>

<style lang="scss" scoped>
.skeleton {
  &::before {
    content: '\00a0';
  }

  &.variant--pulse {
    animation: pulse var(--animation-speed) linear 0.5s infinite;
  }

  &.variant--wave,
  &.variant--blink {
    &::after {
      @apply content-empty absolute inset-0 z-0;
    }
  }

  &.variant--blink::after {
    @apply bg-white/70;
    animation: fade var(--animation-speed) linear 0.5s infinite alternate;
  }

  &.variant--wave::after {
    @apply z-0;
    background: linear-gradient(90deg, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.75), rgba(255, 255, 255, 0));
    animation: wave var(--animation-speed) linear 0.5s infinite;
  }
}

.dark {
  .skeleton {
    &.variant--wave::after {
      background: linear-gradient(90deg, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0));
    }

    &.variant--blink::after {
      @apply bg-white/20;
    }
  }
}

@keyframes wave {
  0% {
    transform: translateX(-100%);
  }

  100% {
    transform: translateX(100%);
  }
}

@keyframes fade {
  0% {
    opacity: 0;
  }

  50% {
    opacity: 0.4;
  }

  100% {
    opacity: 1;
  }
}

@keyframes pulse {
  0% {
    opacity: 1;
    transform: scale(1);
  }

  50% {
    opacity: 0.5;
    transform: scale(0.85);
  }

  100% {
    opacity: 1;
    transform: scale(1);
  }
}
</style>

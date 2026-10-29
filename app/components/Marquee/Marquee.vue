<script setup lang="ts">
// Types
import type { IMarqueeProps } from './types/marquee-props.type'

// Constants
import { MARQUEE_DEFAULT_PROPS } from './constants/marquee-default-props.constant'

const props = withDefaults(defineProps<IMarqueeProps>(), {
  ...getComponentProps('marquee'),
})

// Utils
const mergedProps = computed(() => {
  return getComponentMergedProps('marquee', props)
})

// Styles - container
const containerClass = computed(() => {
  return mergedProps.value?.ui?.containerClass?.({
    defaults: MARQUEE_DEFAULT_PROPS.ui.containerClass(),
  })
})

const containerStyle = computed(() => {
  return [
    { '--duration': props.duration, '--gap': props.gap },
    mergedProps.value?.ui?.containerStyle?.(),
  ]
})

// Styles - track
const contentClass = computed(() => {
  return [
    props.vertical ? 'animate-marquee-vertical' : 'animate-marquee',
    mergedProps.value?.ui?.contentClass?.({
      defaults: MARQUEE_DEFAULT_PROPS.ui.contentClass({
        pauseOnHover: props.pauseOnHover ?? false,
        vertical: props.vertical ?? false,
      }),
      pauseOnHover: props.pauseOnHover ?? false,
      vertical: props.vertical ?? false,
    }),
  ]
})

const contentStyle = computed(() => {
  return mergedProps.value?.ui?.contentStyle?.({
    reverse: props.reverse ?? false,
  }) ?? {
    animationDirection: props.reverse ? 'reverse' : 'normal',
  }
})
</script>

<template>
  <div
    class="marquee"
    :class="[{ 'is-vertical': vertical }, containerClass]"
    :style="containerStyle"
  >
    <div
      v-for="index in repeat"
      :key="index"
      :class="contentClass"
      :style="contentStyle"
    >
      <slot />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.marquee {
  &.is-vertical {
    @apply flex-col;
  }
}

.animate-marquee {
  animation: marquee var(--duration) linear infinite;
  animation-direction: reverse;
}

.animate-marquee-vertical {
  animation: marquee-vertical var(--duration) linear infinite;
}

@keyframes marquee {
  from {
    transform: translateX(0);
  }

  to {
    transform: translateX(calc(-100% - var(--gap)));
  }
}

@keyframes marquee-vertical {
  from {
    transform: translateY(0);
  }

  to {
    transform: translateY(calc(-100% - var(--gap)));
  }
}
</style>

<script setup lang="ts">
// Types
import type { IVerticalScrollerProps } from './types/scroller-props.type'

// Functions
import { useScrollerScroll } from './composables/useScrollerScroll'

// Constants
import { SCROLLER_DEFAULT_PROPS } from './constants/scroller-default-props.constant'

const props = withDefaults(defineProps<IVerticalScrollerProps>(), {
  ...getComponentProps('verticalScroller'),
})

const emits = defineEmits<{
  (e: 'resized'): void
  (e: 'scrolled', x: number): void
}>()

// Utils
const mergedProps = computed(() => {
  return getComponentMergedProps('verticalScroller', props)
})

// Layout
const sourceY = defineModel<number>('scrollPosition', { default: 0 })

const {
  y,
  scrollEl,
  arrivedState,
  isOverflown,
  measure,
  handleWheel,
  handleScrollViaBtn,
} = useScrollerScroll()

syncRef(sourceY, y, { direction: 'both', immediate: false })

function addEventListener() {
  useEventListener(scrollEl, 'wheel', handleWheel, { passive: false })
}

onMounted(() => {
  y.value = sourceY.value
})

useResizeObserver(scrollEl, () => {
  requestAnimationFrame(() => {
    emits('resized')
    measure()
  })
})

// Styles
const containerClass = computed(() => {
  return mergedProps.value?.ui?.containerClass?.({
    defaults: SCROLLER_DEFAULT_PROPS.ui.verticalContainerClass(),
  })
})

const containerStyle = computed(() => {
  return mergedProps.value?.ui?.containerStyle?.()
})

const contentClass = computed(() => {
  return mergedProps.value?.ui?.contentClass?.({
    defaults: SCROLLER_DEFAULT_PROPS.ui.verticalContentClass(),
  })
})

const contentStyle = computed(() => {
  return mergedProps.value?.ui?.contentStyle?.()
})

const arrowClass = computed(() => {
  return mergedProps.value?.ui?.arrowClass?.({
    defaults: SCROLLER_DEFAULT_PROPS.ui.arrowClass(),
  })
})

const arrowStyle = computed(() => {
  return mergedProps.value?.ui?.arrowStyle?.()
})

defineExpose({
  scroll: (top: number, diff?: boolean) => {
    if (diff) {
      y.value = y.value + top
    } else {
      y.value = top
    }
  },
  getScrollDimensions: () => ({
    width: scrollEl.value?.scrollWidth || 0,
    height: scrollEl.value?.scrollHeight || 0,
  }),
  measure,
})
</script>

<template>
  <div
    class="scroller-vertical"
    :class="[`arrows--${arrows}`, { 'is-overflown': isOverflown }, containerClass]"
    :style="containerStyle"
  >
    <!-- Top arrow -->
    <div
      v-if="arrows === 'outside' || !arrivedState.top"
      class="arrow arrow--top"
      :class="[{ 'is-active': !arrivedState.top }, arrowClass]"
      :style="arrowStyle"
    >
      <Btn
        name="scroll-top"
        size="xs"
        self-center
        no-dim
        no-hover-effect
        icon="i-majesticons:chevron-up"
        @pointerdown.stop.prevent="handleScrollViaBtn(false, 'y')"
      />
    </div>

    <div
      ref="scrollEl"
      hide-scrollbar
      class="content"
      :class="contentClass"
      :style="contentStyle"
      @vue:mounted="addEventListener"
    >
      <slot />
    </div>

    <!-- Bottom arrow -->
    <div
      v-if="arrows === 'outside' || !arrivedState.bottom"
      class="arrow arrow--bottom"
      :class="[{ 'is-active': !arrivedState.bottom }, arrowClass]"
      :style="arrowStyle"
    >
      <Btn
        name="scroll-bottom"
        size="xs"
        self-center
        no-dim
        no-hover-effect
        icon="i-majesticons:chevron-down"
        @pointerdown.stop.prevent="handleScrollViaBtn(true, 'y')"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.scroller-vertical {
  @apply flex flex-col relative items-center overflow-hidden;
}

.content {
  @apply flex flex-col flex-1 overflow-auto w-full;
}

.arrow {
  @apply color-ca dark:hover:color-white hover:color-black;
}

.arrows--inside {
  .arrow {
    @apply absolute w-16 w-full flex z-5 pointer-events-none;

    .btn {
      @apply opacity-20 pointer-events-auto;
    }

    &:not(.is-active) {
      .btn {
        @apply opacity-0 pointer-events-none;
      }
    }

    &.is-active {
      &.arrow--top {
        background: linear-gradient(to bottom, theme('colors.truegray.200') 0%, transparent);
      }

      &.arrow--bottom {
        background: linear-gradient(to top, theme('colors.truegray.200') 0%, transparent);
      }

      > .btn {
        @apply opacity-85 hover:bg-white dark:hover:bg-black/50;
      }
    }

    &--bottom {
      @apply bottom-0 justify-center;
    }

    &--top {
      @apply top-0 justify-center;
    }
  }
}

.dark {
  .arrows--inside {
    .is-active.arrow {
      &--top {
        background: linear-gradient(to bottom, theme('colors.truegray.800') 0%, transparent);
      }

      &--bottom {
        background: linear-gradient(to top, theme('colors.truegray.800') 0%, transparent);
      }
    }
  }
}

.arrows--outside {
  @apply gap-x-1;

  .arrow {
    @apply relative;
  }

  .arrow:not(.is-active) {
    > .btn {
      @apply opacity-15 pointer-events-none;
    }
  }
}
</style>

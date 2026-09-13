<script setup lang="ts" vapor>
// Types
import type { IHorizontalScrollerProps } from './types/scroller-props.type'

// Functions
import { useScrollerScroll } from './composables/useScrollerScroll'

// Constants
import { SCROLLER_DEFAULT_PROPS } from './constants/scroller-default-props.constant'

import './styles/scroll-fade.css'

const props = withDefaults(defineProps<IHorizontalScrollerProps>(), {
  ...getComponentProps('horizontalScroller'),
})

const emits = defineEmits<{
  (e: 'resized'): void
  (e: 'scrolled', x: number): void
}>()

// Utils
const mergedProps = computed(() => {
  return getComponentMergedProps('horizontalScroller', props)
})

// Layout
const sourceX = defineModel<number>('scrollPosition', { default: 0 })

const {
  x,
  scrollEl,
  arrivedState,
  isOverflown,
  measure,
  handleWheel,
  handleScrollViaBtn,
} = useScrollerScroll(position => emits('scrolled', position), 'x')

syncRef(sourceX, x, { direction: 'both', immediate: false })

useEventListener(scrollEl, 'wheel', handleWheel, { passive: false })

onMounted(() => {
  x.value = sourceX.value
})

const resizeTask = useRafTask(() => {
  emits('resized')
  measure()
})
useResizeObserver(scrollEl, resizeTask.schedule)

// Styles - container
const containerClass = computed(() => {
  return mergedProps.value?.ui?.containerClass?.({
    defaults: SCROLLER_DEFAULT_PROPS.ui.horizontalContainerClass(),
  })
})

const containerStyle = computed(() => {
  return mergedProps.value?.ui?.containerStyle?.()
})

// Styles - content
const contentClass = computed(() => {
  return mergedProps.value?.ui?.contentClass?.({
    defaults: SCROLLER_DEFAULT_PROPS.ui.contentClass(),
  })
})

const contentStyle = computed(() => {
  return mergedProps.value?.ui?.contentStyle?.()
})

// Styles - arrow
const arrowClass = computed(() => {
  return mergedProps.value?.ui?.arrowClass?.({
    defaults: SCROLLER_DEFAULT_PROPS.ui.arrowClass(),
  })
})

const arrowStyle = computed(() => {
  return mergedProps.value?.ui?.arrowStyle?.()
})

defineExpose({
  element: scrollEl,
  scroll: (left: number, diff?: boolean) => {
    if (diff) {
      x.value = x.value + left
    } else {
      x.value = left
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
    class="scroller-horizontal"
    :class="[`arrows--${arrows}`, { 'is-overflown': isOverflown }, containerClass]"
    :style="containerStyle"
  >
    <!-- Left arrow -->
    <div
      v-if="arrows === 'outside' || !arrivedState.left"
      class="arrow arrow--left"
      :class="[{ 'is-active': !arrivedState.left }, arrowClass]"
      :style="arrowStyle"
    >
      <Btn
        name="scroll-left"
        size="xs"
        self-center
        no-dim
        no-hover-effect
        icon="i-majesticons:chevron-left"
        @pointerdown.stop.prevent="handleScrollViaBtn(false, 'x')"
      />
    </div>

    <div
      ref="scrollEl"
      hide-scrollbar
      class="content"
      :class="contentClass"
      :style="contentStyle"
    >
      <slot />
    </div>

    <!-- Right arrow -->
    <div
      v-if="arrows === 'outside' || !arrivedState.right"
      class="arrow arrow--right"
      :class="[{ 'is-active': !arrivedState.right }, arrowClass]"
      :style="arrowStyle"
    >
      <Btn
        name="scroll-right"
        size="xs"
        self-center
        no-dim
        no-hover-effect
        icon="i-majesticons:chevron-right"
        @pointerdown.stop.prevent="handleScrollViaBtn(true, 'x')"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.scroller-horizontal {
  @apply flex relative overflow-hidden;
}

.content {
  @apply flex grow overflow-auto;
}

.arrow {
  @apply color-ca dark:hover:color-white hover:color-black;
}

.arrows--inside {
  .arrow {
    @apply absolute w-8 h-full max-h-20 flex z-5 pointer-events-none top-1/2 translate-y--1/2;

    .btn {
      @apply opacity-20 pointer-events-auto;
    }

    &:not(.is-active) {
      .btn {
        @apply opacity-0 pointer-events-none;
      }
    }

    &.is-active {
      > .btn {
        @apply opacity-85 hover:bg-white dark:hover:bg-black/50;
      }
    }

    &--right {
      @apply right-0 justify-end;
    }

    &--left {
      @apply left-0 justify-start;
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

<script setup lang="ts">
// Types
import type { IScrollerProps } from './types/scroller-props.type'

// Functions
import { useScrollerScroll } from './composables/useScrollerScroll'
import { getComponentMergedProps, getComponentProps } from '../../functions/get-component-props'

const props = withDefaults(defineProps<IScrollerProps>(), {
  ...getComponentProps('scroller'),
})

const emits = defineEmits<{
  (e: 'resized'): void
  (e: 'scrolled', x: number): void
}>()

// Utils
const mergedProps = computed(() => {
  return getComponentMergedProps('scroller', props)
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
} = useScrollerScroll()

syncRef(sourceX, x, { direction: 'both', immediate: false })

function addEventListener() {
  useEventListener(scrollEl, 'wheel', handleWheel, { passive: false })
}

onMounted(() => {
  x.value = sourceX.value
})

useResizeObserver(scrollEl, () => {
  requestAnimationFrame(() => {
    emits('resized')
    measure()
  })
})

defineExpose({
  scroll: (left: number) => x.value = left,
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
    :class="[`arrows--${arrows}`, { 'is-overflown': isOverflown }]"
  >
    <!-- Left arrow -->
    <div
      v-if="arrows === 'outside' || !arrivedState.left"
      class="arrow arrow--left"
      :class="{ 'is-active': !arrivedState.left }"
    >
      <Btn
        name="scroll-left"
        size="xs"
        self-center
        no-dim
        no-hover-effect
        icon="i-majesticons:chevron-left"
        @pointerdown.stop.prevent="handleScrollViaBtn(false)"
      />
    </div>

    <div
      ref="scrollEl"
      hide-scrollbar
      class="content"
      :class="mergedProps.ui?.contentClass"
      @vue:mounted="addEventListener"
    >
      <slot />
    </div>

    <!-- Right arrow -->
    <div
      v-if="arrows === 'outside' || !arrivedState.right"
      class="arrow arrow--right"
      :class="{ 'is-active': !arrivedState.right }"
    >
      <Btn
        name="scroll-right"
        size="xs"
        self-center
        no-dim
        no-hover-effect
        icon="i-majesticons:chevron-right"
        @pointerdown.stop.prevent="handleScrollViaBtn(true)"
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
      &.arrow--left {
        background: linear-gradient(to right, rgba(64, 64, 64, 0.2) 0%, rgba(64, 64, 64, 0.2) 8px, transparent);
      }

      &.arrow--right {
        background: linear-gradient(to left, rgba(64, 64, 64, 0.2) 0%, rgba(64, 64, 64, 0.2) 8px, transparent);
      }

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

.dark {
  .arrows--inside {
    .is-active.arrow {
      &--left {
        background: linear-gradient(to right, rgba(64, 64, 64, 0.6) 0%, rgba(64, 64, 64, 0.6) 8px, transparent);
      }

      &--right {
        background: linear-gradient(to left, rgba(64, 64, 64, 0.6) 0%, rgba(64, 64, 64, 0.6) 8px, transparent);
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

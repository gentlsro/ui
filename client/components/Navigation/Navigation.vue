<script setup lang="ts">
import { uiConfig } from '$uiConfig'

// Types
import type { INavigationProps } from './types/navigation-props.type'

// Functions
import { getComponentMergedProps, getComponentProps } from '../../functions/get-component-props'

const props = withDefaults(defineProps<INavigationProps>(), {
  ...getComponentProps('navigation'),
})

// Constants
// How many pixels do I need to scroll 'top' to reveal navigation after being hidden
const SCROLL_TRIGGER_PX = 80

// Store
const {
  navigationHeight,
  isDrawerOpen,
} = storeToRefs(useLayoutStore())

// Utils
const mergedProps = computed(() => {
  return getComponentMergedProps('navigation', props)
})

// Layout
const isInitialized = ref(false)
const minHeight = uiConfig.navigation.defaultNavigationHeight
const headerEl = useTemplateRef('headerEl')
const navigationEl = useTemplateRef('navigationEl')
const { height } = useElementSize(headerEl)

syncRef(height, navigationHeight, { direction: 'ltr' })

// Scroll utils
const lastScrollDirection = ref<'up' | 'down'>('down')
const diff = ref(0)

const { arrivedState, y } = useScroll(
  () => import.meta.client ? window : null,
  { throttle: 10 },
)

const isScrolled = computed(() => !arrivedState.top)

watch(y, (oldY, y) => {
  let newScrollDirection: 'up' | 'down'

  if (oldY > y) {
    newScrollDirection = 'down'
  } else {
    newScrollDirection = 'up'
  }

  // Reset diff if direction changes
  if (lastScrollDirection.value !== newScrollDirection) {
    diff.value = 0
  }

  diff.value += Math.abs(oldY - y)
  lastScrollDirection.value = newScrollDirection
})

const isNavigationHidden = computed(() => {
  if (!navigationEl.value || props.noHide) {
    return false
  }

  const hasScrollerMoreThanNavigationHeight = y.value >= navigationEl.value.offsetHeight
  const hasScrolledDown = lastScrollDirection.value === 'down'

  const hasScrolledUpEnough = !(
    diff.value > SCROLL_TRIGGER_PX && lastScrollDirection.value === 'up'
  )

  return (
    hasScrollerMoreThanNavigationHeight
    && (hasScrolledDown || hasScrolledUpEnough)
  )
})

onMounted(() => {
  nextTick(() => (isInitialized.value = true))
})
</script>

<template>
  <header
    ref="headerEl"
    z="$zNavigation"
    class="navigation-wrapper"
    :class="[
      mergedProps.ui?.headerClass,
      {
        'has-shadow': isScrolled && !noShadow,
        'is-hidden': isNavigationHidden && !isDrawerOpen.left && !isDrawerOpen.right,
        'is-initialized': isInitialized,
      },
    ]"
    :style="{ ...mergedProps.ui?.headerStyle, minHeight: `${minHeight}px` }"
  >
    <div
      ref="navigationEl"
      :class="mergedProps?.ui?.navigationClass"
      :style="mergedProps?.ui?.navigationStyle"
    >
      <slot />
    </div>
  </header>
</template>

<style lang="scss" scoped>
header {
  @apply relative flex top-0 inset-inline-0 transition-transform ease-linear;

  &.is-hidden {
    @apply -translate-y-100%;
  }

  &.is-initialized {
    @apply fixed;
  }
}
</style>

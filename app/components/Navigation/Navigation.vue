<script setup lang="ts">
import { uiConfig } from '$uiConfig'

// Types
import type { INavigationProps } from './types/navigation-props.type'

// Store
import { useLayoutStore } from '../../stores/layout.store'

// Constants
import { NAVIGATION_DEFAULT_PROPS } from './constants/navigation-default-props.constant'

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

watchEffect(() => {
  if (headerEl.value) {
    navigationHeight.value = height.value
  }
})

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

// Classes
const classes = computed(() => {
  return [
    {
      'has-shadow': isScrolled.value && !props.noShadow,
      'is-hidden': isNavigationHidden.value && !isDrawerOpen.value.left && !isDrawerOpen.value.right,
      'is-initialized': isInitialized.value,
      'is-sticky': props.sticky,
    },
  ]
})

// Styles - header
const headerClass = computed(() => {
  return mergedProps.value?.ui?.headerClass?.({
    defaults: NAVIGATION_DEFAULT_PROPS.ui.headerClass(),
  })
})

const headerStyle = computed(() => {
  return mergedProps.value?.ui?.headerStyle?.()
})

// Styles - navigation
const navigationClass = computed(() => {
  return mergedProps.value?.ui?.navigationClass?.({
    defaults: NAVIGATION_DEFAULT_PROPS.ui.navigationClass(),
  })
})

const navigationStyle = computed(() => {
  return mergedProps.value?.ui?.navigationStyle?.()
})
</script>

<template>
  <header
    ref="headerEl"
    z="$zNavigation"
    class="navigation-wrapper group"
    :class="[classes, headerClass]"
    :style="{ ...headerStyle, minHeight: `${minHeight}px` }"
  >
    <div
      ref="navigationEl"
      :class="navigationClass"
      :style="navigationStyle"
    >
      <slot />
    </div>
  </header>
</template>

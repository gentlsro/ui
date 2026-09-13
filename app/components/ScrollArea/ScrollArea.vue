<script setup lang="ts" vapor>
import PerfectScrollbar from 'perfect-scrollbar'

// Types
import type { IScrollAreaProps } from './types/scroll-area-props.type'

// Constants
import { SCROLL_AREA_DEFAULT_PROPS } from './constants/scroll-area-default-props.constant'

const props = withDefaults(defineProps<IScrollAreaProps>(), {
  ...getComponentProps('scrollArea'),
})

// Utils
const mergedProps = computed(() => {
  return getComponentMergedProps('scrollArea', props)
})

// Layout
const scrollArea = useTemplateRef<HTMLDivElement>('scrollArea')
const ps = shallowRef<PerfectScrollbar>()

let initTimer: ReturnType<typeof setTimeout> | undefined
let scrollTimer: ReturnType<typeof setTimeout> | undefined
let updateFrame: number | undefined

// Observed content
const contentEls = computedWithControl(
  () => [scrollArea.value],
  () => {
    if (!scrollArea.value) {
      return []
    }

    const children = scrollArea.value?.children ?? []

    // Rails do not exist until initialization; keep all actual slot children.
    return Array.from(children).filter(element => {
      return !element.classList.contains('ps__rail-x')
        && !element.classList.contains('ps__rail-y')
    })
  },
)

// Scrollbar initialization
function init() {
  if (scrollArea.value && !ps.value) {
    ps.value = new PerfectScrollbar(scrollArea.value, {
      wheelSpeed: 0.75,
      scrollXMarginOffset: 1,
      scrollYMarginOffset: 1,
      ...(props.options || {}),
    })
  }
}

// Lifecycle
onMounted(() => {
  // Wait for the surrounding overlay transition to avoid flashing scrollbars
  // while its dimensions are still changing. `immediate` skips this delay.
  if (scrollArea.value) {
    const parentFloatingUI = scrollArea.value.closest<HTMLElement>('.menu, .dialog')

    if (parentFloatingUI?.classList.contains('has-transition') && !props.immediate) {
      const transitionDurationString = parentFloatingUI.style.getPropertyValue('--transitionDuration')
      const transitionDuration = Number(stringToFloat(transitionDurationString))

      initTimer = setTimeout(init, transitionDuration + 50)
    } else {
      init()
    }
  }
})

onBeforeUnmount(() => {
  // Pending work belongs to this mount and must not touch a detached element.
  clearTimeout(initTimer)
  clearTimeout(scrollTimer)

  if (!isNil(updateFrame)) {
    cancelAnimationFrame(updateFrame)
  }

  ps.value?.destroy()
  ps.value = undefined
})

// Content size changes
useResizeObserver(contentEls, () => {
  // Several children may resize together; coalesce updates into one frame.
  if (!isNil(updateFrame)) {
    cancelAnimationFrame(updateFrame)
  }

  updateFrame = requestAnimationFrame(() => {
    updateFrame = undefined
    ps.value?.update()
  })
})

// Refresh observed elements when slot children are added or removed.
useMutationObserver(scrollArea, () => {
  contentEls.trigger()
}, { childList: true })

// Styles - container
const containerClass = computed(() => {
  return mergedProps.value?.ui?.containerClass?.({
    defaults: SCROLL_AREA_DEFAULT_PROPS.ui.containerClass(),
  })
})

const containerStyle = computed(() => {
  return mergedProps.value?.ui?.containerStyle?.()
})

// Public API
defineExpose({
  update: () => ps.value?.update(),
  scrollToBottom: () => {
    if (scrollArea.value) {
      // Defer the scroll so synchronous content changes can reach the DOM first.
      clearTimeout(scrollTimer)
      scrollTimer = setTimeout(() => {
        if (scrollArea.value) {
          scrollArea.value.scrollTop = scrollArea.value.scrollHeight
        }
      }, 0)
    }
  },
})
</script>

<template>
  <div
    ref="scrollArea"
    class="scroll-area"
    :class="containerClass"
    :style="containerStyle"
  >
    <slot />
  </div>
</template>

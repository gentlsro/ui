<script setup lang="ts">
import PerfectScrollbar from 'perfect-scrollbar'
import type { MaybeElement } from '@vueuse/core'

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
const scrollArea = ref<HTMLDivElement>()
const ps = ref<PerfectScrollbar>()
const self = getCurrentInstance()

const contentEls = computedWithControl(
  () => [scrollArea.value],
  () => {
    if (!scrollArea.value) {
      return
    }

    const children = scrollArea.value?.children ?? []

    return Array.from(children)
      .slice(0, -2) as MaybeElement[]
  },
)

function init() {
  if (scrollArea.value) {
    ps.value = new PerfectScrollbar(scrollArea.value, {
      wheelSpeed: 0.75,
      scrollXMarginOffset: 1,
      scrollYMarginOffset: 1,
      ...(props.options || {}),
    })
  }
}

onMounted(() => {
  // We add timeout to prevent scrollbars to show when waiting for animation
  if (scrollArea.value) {
    const parentFloatingUI = (self?.vnode.el as HTMLElement)?.closest('.menu, .dialog') as HTMLElement

    if (parentFloatingUI?.classList.contains('has-transition') && !props.immediate) {
      const transitionDurationString = parentFloatingUI.style.getPropertyValue('--transitionDuration')
      const transitionDuration = Number(stringToFloat(transitionDurationString))

      setTimeout(() => {
        init()
      }, transitionDuration + 50)
    } else {
      init()
    }
  }
})

onBeforeUnmount(() => {
  ps.value?.destroy()
})

// @ts-expect-error This doesnt allow `computedRef` type but works totally fine
useResizeObserver(contentEls, () => {
  requestAnimationFrame(() => {
    ps.value?.update()
  })
})

useMutationObserver(scrollArea, () => {
  contentEls.trigger()
}, { childList: true })

// Styles
const containerClass = computed(() => {
  return mergedProps.value?.ui?.containerClass?.({
    defaults: SCROLL_AREA_DEFAULT_PROPS.ui.containerClass(),
  })
})

const containerStyle = computed(() => {
  return mergedProps.value?.ui?.containerStyle?.()
})

defineExpose({
  update: () => ps.value?.update(),
  scrollToBottom: () => {
    if (scrollArea.value) {
      setTimeout(
        () => (scrollArea.value!.scrollTop = scrollArea.value!.scrollHeight),
        0,
      )
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

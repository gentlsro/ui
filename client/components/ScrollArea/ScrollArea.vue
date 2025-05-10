<script setup lang="ts">
import { stringToFloat } from '$utils'
import PerfectScrollbar from 'perfect-scrollbar'

// Types
import type { IScrollAreaProps } from './types/scroll-area-props.type'

// Regex

const props = defineProps<IScrollAreaProps>()

const scrollArea = ref<HTMLDivElement>()
const ps = ref<PerfectScrollbar>()
const self = getCurrentInstance()

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

    if (parentFloatingUI?.classList.contains('has-transition')) {
      const transitionDurationString = parentFloatingUI.style.getPropertyValue('--transitionDuration')
      const transitionDuration = Number(stringToFloat(transitionDurationString))

      setTimeout(() => {
        init()
      }, transitionDuration + 25)
    } else {
      init()
    }
  }
})

onBeforeUnmount(() => {
  ps.value?.destroy()
})

useResizeObserver(scrollArea, () => {
  requestAnimationFrame(() => {
    ps.value?.update()
  })
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
  >
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.scroll-area {
  @apply overflow-hidden;
}
</style>

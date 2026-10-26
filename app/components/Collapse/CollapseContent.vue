<script setup lang="ts" vapor>
// Types
import type { ICollapseProps } from './types/collapse-props.type'

// Constants
import { COLLAPSE_DEFAULT_PROPS } from './constants/collapse-default-props.constant'

type IProps = Pick<ICollapseProps, 'ui' | 'floating' | 'noTransition' | 'noHeightCalculation' | 'contentHeight' | 'maxContentHeight' | 'autoAdjustHeight'>
  & { isOpen: boolean }

const props = defineProps<IProps>()
const emits = defineEmits<{
  (e: 'before-show'): void
  (e: 'before-hide'): void
  (e: 'show'): void
  (e: 'hide'): void
}>()

// Layout
const contentEl = useTemplateRef<HTMLDivElement>('contentEl')
const contentInnerEl = useTemplateRef<HTMLDivElement>('contentInnerEl')
const inTransition = ref(false)
const heightTask = useRafTask((height: number) => {
  const el = contentEl.value
  if (el?.isConnected && props.isOpen && !props.noHeightCalculation) {
    el.style.height = `${height}px`
  }
})

function handleTransition(when: 'before' | 'after') {
  const toEmit = [
    when === 'before' ? 'before-' : '',
    props.isOpen ? 'show' : 'hide',
  ]

  // @ts-expect-error
  emits(toEmit.join(''))

  if (props.noHeightCalculation) {
    return
  }

  if (when === 'before' && props.isOpen) {
    inTransition.value = true
  }
}

watch(
  () => props.isOpen,
  async (isOpen, _, onCleanup) => {
    let active = true
    onCleanup(() => {
      active = false
      heightTask.cancel()
    })
    if (props.noHeightCalculation) {
      return
    }

    const el = contentEl.value
    if (!el?.isConnected) {
      return
    }

    if (isOpen) {
      el.style.height = '0px'

      heightTask.schedule(getContentHeight(el.scrollHeight))
    } else {
      el.style.height = `${getContentHeight(el.scrollHeight)}px`

      await nextTick()
      if (active && el === contentEl.value && el.isConnected) {
        el.style.height = '0px'
      }
    }
  },
)

function getContentHeight(actualContentHeight: number) {
  const maxContentHeight = props.maxContentHeight ?? Number.MAX_SAFE_INTEGER
  const contentHeight = props.contentHeight ?? actualContentHeight

  return Math.min(maxContentHeight, contentHeight)
}

function getAutoContentHeight() {
  const el = contentEl.value
  const inner = contentInnerEl.value
  if (!el || !inner) {
    return 0
  }
  const style = getComputedStyle(el)
  const frame = style.boxSizing === 'border-box'
    ? Number.parseFloat(style.borderTopWidth) + Number.parseFloat(style.borderBottomWidth)
    + Number.parseFloat(style.paddingTop) + Number.parseFloat(style.paddingBottom)
    : 0

  return getContentHeight(inner.scrollHeight + frame)
}

function onTransitionEnd() {
  if (props.noHeightCalculation) {
    return
  }

  const el = contentEl.value as HTMLDivElement
  inTransition.value = false

  if (el) {
    el.style.height = props.autoAdjustHeight && props.isOpen
      ? `${getAutoContentHeight()}px`
      : ''
    el.style.maxHeight = props.maxContentHeight !== undefined ? `${props.maxContentHeight}px` : ''
  }
}

const resizeTarget = computed(() => props.autoAdjustHeight && props.isOpen && !props.noHeightCalculation
  ? contentInnerEl.value
  : undefined)
useResizeObserver(resizeTarget, () => {
  if (contentInnerEl.value) {
    heightTask.schedule(getAutoContentHeight())
  }
})
watch([() => props.contentHeight, () => props.maxContentHeight, () => props.autoAdjustHeight], () => {
  if (props.autoAdjustHeight && contentInnerEl.value && props.isOpen) {
    heightTask.schedule(getAutoContentHeight())
  } else if (contentEl.value && !props.autoAdjustHeight) {
    contentEl.value.style.height = ''
  }
})
watch(() => props.noHeightCalculation, disabled => {
  if (disabled && contentEl.value) {
    heightTask.cancel()
    contentEl.value.style.height = ''
  }
})

const contentClass = computed(() => {
  return props.ui?.contentClass?.({
    defaults: COLLAPSE_DEFAULT_PROPS.ui.contentClass(),
  })
})

const contentStyle = computed(() => {
  return {
    ...props.ui?.contentStyle?.(),
    maxHeight: props.maxContentHeight !== undefined ? `${props.maxContentHeight}px` : undefined,
  }
})

const contentInnerClass = computed(() => {
  return props.ui?.contentInnerClass?.({
    defaults: COLLAPSE_DEFAULT_PROPS.ui.contentInnerClass(),
  })
})

const contentInnerStyle = computed(() => {
  return props.ui?.contentInnerStyle?.()
})
</script>

<template>
  <Transition
    :css="!noTransition && !noHeightCalculation"
    @before-enter="handleTransition('before')"
    @before-leave="handleTransition('before')"
    @after-enter="handleTransition('after')"
    @after-leave="handleTransition('after')"
  >
    <div
      v-show="isOpen"
      ref="contentEl"
      class="collapse__content"
      :class="[contentClass, {
        'is-floating': floating,
        'in-transition': inTransition,
        'auto-adjust-height': autoAdjustHeight && !noTransition && !noHeightCalculation,
      }]"
      :data-state="isOpen ? 'open' : 'closed'"
      :style="contentStyle"
      @transitionend="onTransitionEnd"
    >
      <div
        ref="contentInnerEl"
        class="collapse__content-inner"
        :class="contentInnerClass"
        :style="contentInnerStyle"
      >
        <slot />
      </div>
    </div>
  </Transition>
</template>

<style lang="scss" scoped>
.collapse__content {
  &.auto-adjust-height {
    transition: height var(--transitionDuration) var(--transitionTimingFunction);
  }
  &.in-transition {
    @apply overflow-hidden;
  }

  &.is-floating {
    @apply absolute top-0 left-0 right-0 bg-white dark:bg-dark-950 z-100;
  }
}

.collapse__content-inner {
  // Measure intrinsic content, rather than a flex child shrinking to its parent.
  flex-shrink: 0;
}

// Transition
.v-enter-active,
.v-leave-active {
  transition-duration: var(--transitionDuration);
  transition-timing-function: var(--transitionTimingFunction);
  transition-property: height, opacity;

  @apply overflow-hidden;
}

.v-enter-from,
.v-leave-to {
  @apply opacity-0 overflow-hidden;
}
</style>

<script setup lang="ts">
// Types
import type { ICollapseProps } from './types/collapse-props.type'

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
const contentEl = ref<HTMLDivElement>()
const inTransition = ref(false)

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
  async isOpen => {
    if (props.noHeightCalculation) {
      return
    }

    const el = contentEl.value as HTMLDivElement

    if (isOpen) {
      el.style.height = '0px'

      await nextTick()
      el.style.height = `${getContentHeight(el.scrollHeight)}px`
    } else {
      el.style.height = `${getContentHeight(el.scrollHeight)}px`

      await nextTick()
      el.style.height = '0px'
    }
  },
)

const contentClass = computed(() => {
  return props.ui?.contentClass?.(props.isOpen)
})

const contentStyle = computed(() => {
  return props.ui?.contentStyle?.(props.isOpen)
})

function getContentHeight(actualContentHeight: number) {
  const maxContentHeight = props.maxContentHeight ?? Number.MAX_SAFE_INTEGER
  const contentHeight = props.contentHeight ?? actualContentHeight

  return Math.min(maxContentHeight, contentHeight)
}

function onTransitionEnd() {
  if (props.noHeightCalculation) {
    return
  }

  const el = contentEl.value as HTMLDivElement
  inTransition.value = false

  if (el) {
    el.style.height = ''
    el.style.maxHeight = props.maxContentHeight ? `${props.maxContentHeight}px` : ''
  }
}

if (props.autoAdjustHeight) {
  // TODO: Implement this
}
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
      :class="[contentClass, { 'is-floating': floating, 'in-transition': inTransition }]"
      :data-state="isOpen ? 'open' : 'closed'"
      :style="contentStyle"
      @transitionend="onTransitionEnd"
    >
      <slot />
    </div>
  </Transition>
</template>

<style lang="scss" scoped>
.collapse__content {
  @apply flex flex-col overflow-auto rounded-b-custom z-10;

  &.is-floating {
    @apply absolute left-0 right-0 bottom-0 translate-y-full;
  }

  &.in-transition {
    @apply overflow-hidden;
  }
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

<script setup lang="ts">
// Types
import type { ICollapseProps } from './types/collapse-props.type'

type IProps = Pick<ICollapseProps, 'ui' | 'floating' | 'noTransition' | 'contentHeight' | 'maxContentHeight'>
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

function handleTransition(when: 'before' | 'after') {
  const toEmit = [
    when === 'before' ? 'before-' : '',
    props.isOpen ? 'show' : 'hide',
  ]

  // @ts-expect-error
  emits(toEmit.join(''))
}

watch(
  () => props.isOpen,
  async isOpen => {
    // When collapse content gets opened, we first wait for the content to be rendered
    if (isOpen) {
      await nextTick()
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

useResizeObserver(contentEl, () => {
  const el = contentEl.value as HTMLDivElement

  requestAnimationFrame(() => {
    el.style.height = `${getContentHeight(el.scrollHeight)}px`
  })
})
</script>

<template>
  <Transition
    :css="!noTransition"
    @before-enter="handleTransition('before')"
    @before-leave="handleTransition('before')"
    @after-enter="handleTransition('after')"
    @after-leave="handleTransition('after')"
  >
    <div
      v-if="isOpen"
      ref="contentEl"
      class="collapse__content"
      :class="[contentClass, { 'is-floating': floating }]"
      :data-state="isOpen ? 'open' : 'closed'"
      :style="contentStyle"
    >
      <slot />
    </div>
  </Transition>
</template>

<style lang="scss" scoped>
.collapse__content {
  @apply flex flex-col overflow-auto rounded-b-custom;

  &.is-floating {
    @apply absolute left-0 right-0 bottom-0 translate-y-full;
  }
}

// Transition
.v-enter-active,
.v-leave-active {
  transition-duration: var(--transitionDuration);
  transition-timing-function: var(--transitionTimingFunction);
  transition-property: height, opacity;
  overflow: hidden !important;
}

.v-enter-from,
.v-leave-to {
  @apply opacity-0;
}
</style>

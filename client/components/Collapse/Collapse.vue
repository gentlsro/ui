<script setup lang="ts">
// Types
import type { ICollapseProps } from './types/collapse-props.type'

// Functions
import { getComponentMergedProps, getComponentProps } from '../../functions/get-component-props'

const props = withDefaults(defineProps<ICollapseProps>(), {
  ...getComponentProps('collapse'),
})

const emits = defineEmits<{
  (e: 'before-show'): void
  (e: 'before-hide'): void
  (e: 'show'): void
  (e: 'hide'): void
}>()

defineSlots<{
  header?: (props: { isOpen: boolean, onClick: () => void, ui: ICollapseProps['ui'] }) => any
  content?: (props: { isOpen: boolean, ui: ICollapseProps['ui'] }) => any
  default?: () => any
}>()

const mergedProps = computed(() => {
  return getComponentMergedProps('collapse', props)
})

// Layout
const isOpen = defineModel<boolean>({ default: false })

async function handleToggle() {
  // Closing
  if (isOpen.value) {
    isOpen.value = false

    return
  }

  // Opening
  const shouldOpen = await props.beforeShowFnc?.() ?? true

  if (shouldOpen) {
    isOpen.value = true
  }
}

// Transitions
const inTransition = ref(false)

function handleTransition(
  ev: TransitionEvent,
  state: 'start' | 'end',
) {
  if (ev.propertyName === 'grid-template-rows') {
    inTransition.value = state === 'start'

    const toEmit = [
      state === 'start' ? 'before-' : '',
      isOpen.value ? 'show' : 'hide',
    ]

    // @ts-expect-error
    emits(toEmit.join(''))
  }
}
</script>

<template>
  <div
    class="collapse"
    :data-state="isOpen ? 'open' : 'closed'"
    :aria-expanded="isOpen"
  >
    <!-- Header -->
    <slot
      name="header"
      :is-open
      :ui="mergedProps.ui"
      :on-click="handleToggle"
    >
      <CollapseHeader
        v-if="title"
        :is-open
        :expand-icon
        :icon
        :loading
        :no-separator
        :subtitle
        :title
        :ui="mergedProps.ui"
        @click="handleToggle"
      />
    </slot>

    <slot
      name="content"
      :ui="mergedProps.ui"
      :is-open
    >
      <CollapseContent
        :is-open
        :floating
        :in-transition
        :ui="mergedProps.ui"
        @transitionstart="handleTransition($event, 'start')"
        @transitionend="handleTransition($event, 'end')"
      >
        <slot />
      </CollapseContent>
    </slot>
  </div>
</template>

<style lang="scss" scoped>
.collapse {
  @apply relative flex flex-col;
}
</style>

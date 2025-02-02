<script setup lang="ts">
// Types
import type { IDrawerProps } from './types/drawer-props.type'

// Functions
import { getComponentMergedProps, getComponentProps } from '../../functions/get-component-props'

const props = withDefaults(defineProps<IDrawerProps>(), {
  ...getComponentProps('drawer'),
})

const emits = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'hide'): void
  (e: 'show'): void
  (e: 'before-hide'): void
  (e: 'before-show'): void
}>()

// Utils
const mergedProps = computed(() => {
  return getComponentMergedProps('drawer', props)
})

// Layout
const model = useVModel(props, 'modelValue', emits)

const drawerClass = computed(() => {
  return [
    `drawer--${props.side}`,
    {
      'is-open': model,
      'is-full-height': props.fullHeight,
      'is-absolute': props.absolute,
    },
  ]
})

function handleTransition(
  ev: TransitionEvent,
  state: 'start' | 'end',
) {
  if (ev.propertyName === 'transform') {
    const toEmit = [
      state === 'start' ? 'before-' : '',
      model.value ? 'show' : 'hide',
    ]

    // @ts-expect-error
    emits(toEmit.join(''))
  }
}
</script>

<template>
  <aside
    class="drawer"
    :class="drawerClass"
    :style="{ width: `${width}px` }"
    @transitionstart="handleTransition($event, 'start')"
    @transitionend="handleTransition($event, 'end')"
  >
    <!-- Title -->
    <slot name="title">
      <DrawerTitle
        v-if="title"
        v-model="model"
        :title="title"
        :ui="mergedProps.ui"
      />
    </slot>

    <slot />
  </aside>
</template>

<style scoped lang="scss">
.drawer {
  @apply fixed flex flex-col flex-gap-1 top-0 opacity-0
    bg-light-200 dark:bg-dark-800 z-$zDrawer max-w-full overflow-auto h-full;

  transition:
    opacity ease-out 200ms,
    transform ease-out 200ms;

  &.is-absolute {
    @apply absolute;
  }

  &:not(.is-full-height) {
    @apply m-t-$navHeight;
    height: calc(100% - var(--navHeight, 0px));
  }

  &--right {
    @apply right-0 translate-x-100%;
  }

  &.is-open {
    @apply translate-x-0 opacity-100;
  }
}
</style>

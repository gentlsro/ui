<script setup lang="ts">
// Types
import type { IDrawerProps } from './types/drawer-props.type'

// Constants
import { DRAWER_DEFAULT_PROPS } from './constants/drawer-default-props.constant'

const props = withDefaults(defineProps<IDrawerProps>(), {
  ...getComponentProps('drawer'),
})

const emits = defineEmits<{
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
const model = defineModel<boolean>({ default: false })

// Styles - container
const containerClass = computed(() => {
  return mergedProps.value?.ui?.containerClass?.({
    defaults: DRAWER_DEFAULT_PROPS.ui.containerClass(),
  })
})

const containerStyle = computed(() => {
  return mergedProps.value?.ui?.containerStyle?.()
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

// Click outside
const drawerEl = ref<HTMLElement | null>(null)

function handleClickOutside(ev: Event) {
  if (!model.value || !props.closeOnClickOutside) {
    return
  }

  const targetEl = ev.target as HTMLElement
  const isPartOfFloatingElement = !!targetEl.closest('.floating-element')
  const isNotifications = !!targetEl.closest('.notifications')

  if (isPartOfFloatingElement || isNotifications) {
    return
  }

  model.value = false
}

onClickOutside(drawerEl, handleClickOutside, {
  ignore: props.ignoreClickOutside,
})
</script>

<template>
  <aside
    ref="drawerEl"
    class="drawer"
    :class="[
      `drawer--${side}`,
      {
        'is-open': model,
        'is-full-height': fullHeight,
        'is-absolute': absolute,
      },
      containerClass,
    ]"
    :style="[{ width: `${width}px` }, containerStyle]"
    @transitionstart="handleTransition($event, 'start')"
    @transitionend="handleTransition($event, 'end')"
  >
    <!-- Title -->
    <slot name="title">
      <DrawerTitle
        v-if="title"
        v-model="model"
        :title
        :ui="mergedProps.ui"
      />
    </slot>

    <slot />
  </aside>
</template>

<style scoped lang="scss">
.drawer {
  transition:
    opacity ease-out 200ms,
    transform ease-out 200ms;

  &:not(.is-full-height):not(.is-absolute) {
    height: calc(100% - var(--navHeight, 0px));
  }
}
</style>

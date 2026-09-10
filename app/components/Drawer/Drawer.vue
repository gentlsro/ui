<script setup lang="ts">
// Types
import type { IDrawerProps } from './types/drawer-props.type'

// Constants
import { BREAKPOINTS } from '../../constants/breakpoints'
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

const title = computed(() => {
  if (typeof props.title === 'function') {
    return props.title()
  }

  return props.title
})

// Positioning
const isBelowAbsoluteBreakpoint = useMediaQuery(() => {
  return props.absoluteBreakpoint
    ? `(max-width: ${BREAKPOINTS[props.absoluteBreakpoint] - 1}px)`
    : 'not all'
})

const isAbsolute = computed(() => !!props.absolute || isBelowAbsoluteBreakpoint.value)
const isRelative = computed(() => props.mode === 'relative' && !isAbsolute.value)

const classes = computed(() => {
  return [
    `drawer--${props.side}`,
    {
      'is-open': model.value,
      'is-full-height': props.fullHeight,
      'is-absolute': isAbsolute.value,
      'is-relative': isRelative.value,
      'is-no-transition': props.noTransition,
    },
  ]
})

const styles = computed(() => {
  // In the `relative` mode the drawer collapses its width when closed
  const isCollapsed = isRelative.value && !model.value

  return {
    '--drawerWidth': `${props.width}px`,
    'width': isCollapsed ? '0px' : `${props.width}px`,
  }
})

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
  const animatedProperty = isRelative.value ? 'width' : 'transform'

  if (ev.propertyName === animatedProperty) {
    const toEmit = [
      state === 'start' ? 'before-' : '',
      model.value ? 'show' : 'hide',
    ]

    // @ts-expect-error
    emits(toEmit.join(''))
  }
}

// Without a transition there are no transition events to derive the
// `show`/`hide` emits from, so emit them around the model change instead
watch(model, isOpen => {
  if (!props.noTransition) {
    return
  }

  if (isOpen) {
    emits('before-show')
    nextTick(() => emits('show'))
  } else {
    emits('before-hide')
    nextTick(() => emits('hide'))
  }
})

// Click outside
const drawerEl = ref<HTMLElement | null>(null)

// The `click` ending a drag (panning, text selection…) must not close the drawer
const { isDragRelease } = useDragRelease()

function handleClickOutside(ev: Event) {
  if (!model.value || !props.closeOnClickOutside || isDragRelease(ev)) {
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
  <Teleport
    :disabled="!referenceEl"
    :to="referenceEl"
  >
    <aside
      ref="drawerEl"
      class="drawer"
      :class="[classes, containerClass]"
      :style="[styles, containerStyle]"
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
  </Teleport>
</template>

<style scoped lang="scss">
.drawer {
  transition:
    opacity ease-out 200ms,
    transform ease-out 200ms,
    width ease-out 200ms;

  &.is-no-transition {
    transition: none;
  }

  &:not(.is-full-height):not(.is-absolute):not(.is-relative) {
    height: calc(100% - var(--navHeight, 0px));
  }
}
</style>

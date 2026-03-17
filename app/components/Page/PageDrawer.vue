<script setup lang="ts">
// Types
import type { IPageDrawerProps } from './types/page-drawer-props.type'

// Store
import { useLayoutStore } from '../../stores/layout.store'

// Constants
import { $bp } from '../../../shared/constants/breakpoints'
import { PAGE_DRAWER_DEFAULT_PROPS } from './constants/page-drawer-default-props.constant'

const props = withDefaults(defineProps<IPageDrawerProps>(), {
  ...getComponentProps('pageDrawer'),
})

// Utils
const mergedProps = computed(() => {
  return getComponentMergedProps('pageDrawer', props)
})

// Store
const { drawerWidth, navigationHeight } = storeToRefs(useLayoutStore())

drawerWidth.value[props.side] = props.width
drawerWidth.value[`${props.side}Mini`] = props.miniWidth

// Layout
const model = defineModel<boolean>({ default: false })
const isMini = defineModel<boolean>('mini', { default: false })

const classes = computed(() => {
  return [
    `page-drawer--${props.side}`,
    `${isMini.value ? 'w-$drawerMiniWidth' : 'w-$drawerWidth'}`,
    {
      'is-mini': isMini.value,
      'is-open': model.value,
      'is-absolute': !$bp[props.absoluteBreakpoint].value,
      'is-absolute-full-width': !isMini.value && !$bp[props.absoluteFullWidthBreakpoint].value,
    },
  ]
})

const styles = computed(() => {
  return {
    container: {
      '--drawerWidth': `${props.width}px`,
      '--drawerMiniWidth': `${props.miniWidth}px`,
      '--navHeight': `${navigationHeight.value}px`,
    },
  }
})

// Styles - container
const containerClass = computed(() => {
  return mergedProps.value?.ui?.containerClass?.({
    defaults: PAGE_DRAWER_DEFAULT_PROPS.ui.containerClass(),
    isMini: isMini.value,
  })
})

const containerStyle = computed(() => {
  return mergedProps.value?.ui?.containerStyle?.({ isMini: isMini.value })
})

// Styles - content
const contentClass = computed(() => {
  return mergedProps.value?.ui?.contentClass?.({
    defaults: PAGE_DRAWER_DEFAULT_PROPS.ui.contentClass(),
    isMini: isMini.value,
  })
})

const contentStyle = computed(() => {
  return mergedProps.value?.ui?.contentStyle?.({ isMini: isMini.value })
})

// Styles - bottom
const bottomClass = computed(() => {
  return mergedProps.value?.ui?.bottomClass?.({
    defaults: PAGE_DRAWER_DEFAULT_PROPS.ui.bottomClass(),
    isMini: isMini.value,
  })
})

const bottomStyle = computed(() => {
  return mergedProps.value?.ui?.bottomStyle?.({ isMini: isMini.value })
})

// Styles - filler
const fillerClass = computed(() => {
  return mergedProps.value?.ui?.fillerClass?.({
    defaults: PAGE_DRAWER_DEFAULT_PROPS.ui.fillerClass(),
    isMini: isMini.value,
  })
})

const fillerStyle = computed(() => {
  return mergedProps.value?.ui?.fillerStyle?.({ isMini: isMini.value })
})

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
    class="page-drawer group"
    :class="[classes, containerClass]"
    :style="[styles.container, containerStyle]"
  >
    <div
      v-if="!fullHeight"
      class="page-drawer-filler"
      :class="fillerClass"
      :style="fillerStyle"
    />

    <div
      class="page-drawer-content"
      :class="contentClass"
      :style="contentStyle"
    >
      <slot :mini="isMini" />
    </div>

    <div
      v-if="!noBottom"
      class="page-drawer-bottom"
      :class="bottomClass"
      :style="bottomStyle"
    >
      <slot name="bottom">
        <Btn
          preset="CHEVRON_RIGHT"
          :ripple="false"
          w="!full"
          size="sm"
          class="!color-black !dark:color-white"
          :class="{ 'rotate-180': !isMini }"
          @click="isMini = !isMini"
        />
      </slot>
    </div>
  </aside>
</template>

<style lang="scss" scoped>
header.is-hidden ~ .page-drawer {
  .page-drawer-filler {
    @apply bg-light dark:bg-dark;
  }
}

.page-drawer {
  transition-property: width transform;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;

  &-filler {
    height: min(52px, var(--navHeight));
  }

  &.is-absolute-full-width {
    @apply w-full;
  }

  &--left {
    @apply left-0 translate-x--100%;

    &.is-open {
      @apply translate-x-0;
    }
  }

  &--right {
    @apply right-0 order-2 translate-x-100%;

    &.is-open {
      @apply translate-x-0;
    }
  }
}
</style>

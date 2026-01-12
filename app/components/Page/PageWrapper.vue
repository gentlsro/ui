<script setup lang="ts">
// Types
import type { IPageWrapperProps } from './types/page-wrapper-props.type'

// Store
import { useLayoutStore } from '../../stores/layout.store'

// Constants
import { PAGE_WRAPPER_DEFAULT_PROPS } from './constants/page-wrapper-default-props.constant'

const props = withDefaults(defineProps<IPageWrapperProps>(), {
  ...getComponentProps('pageWrapper'),
})

// Utils
const route = useRoute()
const { isMobile } = useMobile()

const mergedProps = computed(() => {
  return getComponentMergedProps('pageWrapper', props)
})

// Store
const { navigationHeight, drawerWidth } = storeToRefs(useLayoutStore())

// Layout
const isMounted = ref(false)

const pageWrapperStyle = computed(() => {
  return {
    '--navHeight': `${navigationHeight.value}px`,
    '--drawerLeftWidth': `${drawerWidth.value.left}px`,
    '--drawerRightWidth': `${drawerWidth.value.right}px`,
    '--drawerLeftMiniWidth': `${drawerWidth.value.leftMini}px`,
    '--drawerRightMiniWidth': `${drawerWidth.value.rightMini}px`,
  }
})

const classes = computed(() => {
  return [
    {
      'is-scrollable': route.meta.isPageScrollable,
      'is-mounted': isMounted.value,
      'is-padded': props.pad,
      'is-mobile': isMobile.value,
      'move-content': props.moveContent,
    },
  ]
})

onMounted(() => {
  setTimeout(() => (isMounted.value = true), 250)
})

// Styles - container
const containerClass = computed(() => {
  return mergedProps.value?.ui?.containerClass?.({
    defaults: PAGE_WRAPPER_DEFAULT_PROPS.ui.containerClass(),
  })
})

const containerStyle = computed(() => {
  return mergedProps.value?.ui?.containerStyle?.()
})

// Styles - content
const contentClass = computed(() => {
  return mergedProps.value?.ui?.contentClass?.({
    defaults: PAGE_WRAPPER_DEFAULT_PROPS.ui.contentClass(),
  })
})

const contentStyle = computed(() => {
  return mergedProps.value?.ui?.contentStyle?.()
})
</script>

<template>
  <main
    class="page-wrapper"
    :class="[classes, containerClass]"
    :style="[pageWrapperStyle, containerStyle]"
  >
    <!-- TopBar -->
    <slot name="above" />

    <!-- Breadcrumbs -->
    <Breadcrumbs v-if="breadcrumbs" />

    <!-- Content & Loading -->
    <div
      class="page-wrapper__content"
      :class="contentClass"
      :style="contentStyle"
    >
      <slot name="pageTitle">
        <PageTitle v-bind="pageTitleProps" />
      </slot>

      <!-- Content -->
      <slot v-if="!loading" />

      <!-- Loading -->
      <slot
        v-else
        name="loading"
      >
        <PageWrapperLoading />
      </slot>
    </div>
  </main>
</template>

<style lang="scss" scoped>
.page-wrapper {
  &.is-mounted {
    transition-property: margin transform;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 150ms;
  }
}

// Left
.page-drawer.is-open.page-drawer--left {
  ~ .page-wrapper {
    margin-left: calc(var(--drawerLeftWidth));
  }

  ~ .page-wrapper.move-content {
    margin-left: 0;
    transform: translateX(calc(var(--drawerLeftWidth)));
  }

  &.is-absolute {
    margin-left: 0;
    transform: translateX(0);
  }
}

// Left mini
.page-drawer.is-open.page-drawer--left.is-mini {
  ~ .page-wrapper {
    margin-left: calc(var(--drawerLeftMiniWidth));
  }

  ~ .page-wrapper.move-content {
    margin-left: 0;
    transform: translateX(calc(var(--drawerLeftMiniWidth)));
  }
}

// Right
.page-drawer.is-open.page-drawer--right {
  ~ .page-wrapper {
    margin-right: var(--drawerRightWidth);
  }

  ~ .page-wrapper.move-content {
    margin-right: 0;
    transform: translateX(calc(var(--drawerRightWidth)));
  }
}

// Right mini
.page-drawer.is-open.page-drawer--right.is-mini {
  ~ .page-wrapper {
    margin-right: calc(var(--drawerRightMiniWidth));
  }

  ~ .page-wrapper.move-content {
    margin-right: 0;
    transform: translateX(calc(var(--drawerRightMiniWidth)));
  }
}

.page-drawer.is-absolute:not(.is-mini) {
  ~ .page-wrapper {
    margin-left: 0 !important;
    margin-right: 0 !important;
    transform: translateX(0) !important;
  }
}
</style>

<script setup lang="ts">
// Types
import type { IPageWrapperProps } from './types/page-wrapper-props.type'

// Functions
import { getComponentMergedProps, getComponentProps } from '../../functions/get-component-props'

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
    ...(mergedProps.value.ui?.containerStyle ?? {}),
  }
})

const pageWrapperClass = computed(() => [
  mergedProps.value.ui?.containerClass,
  {
    'is-scrollable': route.meta.isPageScrollable,
    'is-mounted': isMounted.value,
    'is-padded': props.pad,
    'is-mobile': isMobile.value,
    'move-content': props.moveContent,
  },
])

onMounted(() => {
  setTimeout(() => (isMounted.value = true), 250)
})
</script>

<template>
  <main
    class="page-wrapper"
    :class="pageWrapperClass"
    :style="pageWrapperStyle"
  >
    <!-- TopBar -->
    <slot name="above" />

    <!-- Breadcrumbs -->
    <Breadcrumbs v-if="breadcrumbs" />

    <!-- Content & Loading -->
    <div
      class="page-wrapper__content"
      :class="mergedProps.ui?.contentClass"
      :style="mergedProps.ui?.contentStyle"
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
  @apply ease-out grow z-$zPageWrapper;

  &.is-mounted {
    transition-property: margin transform;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 150ms;
  }

  &:not(.is-scrollable) {
    @apply overflow-auto flex flex-col;
  }

  &.is-padded {
    @apply m-t-$navHeight;
  }

  &__content {
    @apply flex flex-col grow overflow-auto;
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

.page-drawer.is-absolute {
  ~ .page-wrapper {
    margin-left: 0 !important;
    margin-right: 0 !important;
    transform: translateX(0) !important;
  }
}

// .page-drawer.is-open.page-drawer--left:not(.is-absolute):not(.is-mini) ~ .page-wrapper {
//   &.is-mobile.move-content {
//     transform: translateX(calc(var(--drawerLeftWidth)));
//   }

//   &:not(.is-mobile),
//   &.is-mobile:not(.move-content) {
//     margin-left: calc(var(--drawerLeftWidth));
//   }
// }

// .page-drawer.is-open.page-drawer--right ~ .page-wrapper {
//   padding-right: var(--drawerRightMiniWidth);
// }

// .page-drawer.is-open.page-drawer--right:not(.is-absolute):not(.is-mini) ~ .page-wrapper {
//   padding-right: var(--drawerRightWidth);
// }
</style>

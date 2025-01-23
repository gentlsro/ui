<script setup lang="ts">
// Types
import type { IPageDrawerProps } from './types/page-drawer-props.type'

// Functions
import { getComponentMergedProps, getComponentProps } from '../../functions/get-component-props'

// Constants
import { $bp } from '../../../shared/constants/breakpoints'

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
const model = defineModel<boolean>({ required: true })
const isMini = defineModel<boolean>('mini', { default: false })

const classes = computed(() => {
  return {
    container: [
      `page-drawer--${props.side}`,
      `${isMini.value ? 'w-$drawerMiniWidth' : 'w-$drawerWidth'}`,
      {
        'is-mini': isMini.value,
        'is-open': model.value,
        'is-absolute': !$bp[props.absoluteBreakpoint].value,
        'is-absolute-full-width': !isMini.value && !$bp[props.absoluteFullWidthBreakpoint].value,
      },
    ],
    content: mergedProps.value.ui?.contentClass?.(isMini.value),
    bottom: mergedProps.value.ui?.bottomClass?.(isMini.value),
    filler: mergedProps.value.ui?.fillerClass?.(isMini.value),
  }
})

const styles = computed(() => {
  return {
    container: {
      '--drawerWidth': `${props.width}px`,
      '--drawerMiniWidth': `${props.miniWidth}px`,
      '--navHeight': `${navigationHeight.value}px`,
    },
    content: mergedProps.value.ui?.contentStyle?.(isMini.value),
    bottom: mergedProps.value.ui?.bottomStyle?.(isMini.value),
    filler: mergedProps.value.ui?.fillerStyle?.(isMini.value),
  }
})
</script>

<template>
  <aside
    class="page-drawer"
    :class="classes.container"
    :style="styles.container"
  >
    <div
      v-if="!fullHeight"
      class="page-drawer-filler"
      :class="classes.filler"
      :style="styles.filler"
    />

    <div
      class="page-drawer-content"
      :class="classes.content"
      :style="styles.content"
    >
      <slot :mini="isMini" />
    </div>

    <div
      v-if="!noBottom"
      class="page-drawer-bottom"
      :class="classes.bottom"
      :style="styles.bottom"
    >
      <slot name="bottom">
        <Btn
          preset="CHEVRON_RIGHT"
          :ripple="false"
          w="!full"
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
  @apply h-full top-0 fixed flex flex-col z-$zPageDrawer pointer-events-none
    ease-out;

  @apply print:hidden;

  transition-property: width transform;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;

  &-filler {
    @apply relative shrink-0;

    height: min(52px, var(--navHeight));
  }

  &.is-absolute {
    .drawer-filler {
      @apply shrink-0;
    }
  }

  &.is-absolute-full-width {
    @apply w-full;
  }

  &-content {
    @apply flex flex-col flex-grow overflow-auto pointer-events-auto;
  }

  &-bottom {
    @apply flex shrink-0 overflow-auto pointer-events-auto;
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

    @screen page {
      margin-right: calc(calc(100% - var(--pageWidth)) / 2);
    }
  }
}
</style>

<script setup lang="ts">
import { uiConfig } from '$uiConfig'

// Types
import type { IBreadcrumbsProps } from './types/breadcrumbs-props.type'

// Functions
import { useBreadcrumbs } from './functions/useBreadcrumbs'
import { getComponentMergedProps, getComponentProps } from '../../functions/get-component-props'

// Constants
import { BUTTON_PRESET } from '../Button/constants/button-preset.constant'

const props = withDefaults(defineProps<IBreadcrumbsProps>(), {
  ...getComponentProps('breadcrumbs'),
})

// Utils
const { breadcrumbs } = useBreadcrumbs()

const mergedProps = computed(() => {
  return getComponentMergedProps('breadcrumbs', props)
})

// Layout
const breadcrumbsItems = computed(() => {
  const homePath = typeof uiConfig.breadcrumbs.home.path === 'function'
    ? uiConfig.breadcrumbs.home.path()
    : uiConfig.breadcrumbs.home.path

  const homeBreacrumb = uiConfig.breadcrumbs.home.component
    ? { component: uiConfig.breadcrumbs.home.component }
    : {
        to: homePath,
        icon: uiConfig.breadcrumbs.home.icon,
        label: uiConfig.breadcrumbs.home.label,
      }

  return [
    homeBreacrumb,
    ...breadcrumbs.value,
  ]
    .flatMap(breadcrumb => [breadcrumb, 'splitter'])
    .slice(0, -1)
})
</script>

<template>
  <div
    class="breadcrumbs-wrapper"
    :class="mergedProps.ui?.wrapperClass"
    :style="mergedProps.ui?.wrapperStyle"
  >
    <div
      class="breadcrumbs"
      :class="mergedProps.ui?.breadcrumbsClass"
      :style="mergedProps.ui?.breadcrumbsStyle"
    >
      <HorizontalScroller :ui="{ contentClass: 'items-center gap-1' }">
        <template
          v-for="(breadcrumb, idx) in breadcrumbsItems"
          :key="idx"
        >
          <!-- Chevron -->
          <span
            v-if="typeof breadcrumb === 'string'"
            :class="BUTTON_PRESET.CHEVRON_RIGHT.icon"
            class="breadcrumb-item"
          />

          <!-- Component -->
          <Component
            :is="breadcrumb.component"
            v-else-if="'component' in breadcrumb && breadcrumb.component"
          />

          <!-- Button -->
          <Btn
            v-else
            v-bind="breadcrumb"
            no-active-link
            color="!dark !dark:light"
            size="sm"
            class="breadcrumb-item"
            no-truncate
            :class="[{ 'is-last': breadcrumb === breadcrumbs[breadcrumbs.length - 1] }]"
            :no-dim="breadcrumb === breadcrumbs[breadcrumbs.length - 1]"
            no-uppercase
          />
        </template>
      </HorizontalScroller>

      <slot name="append" />
    </div>

    <slot name="right" />
  </div>
</template>

<style lang="scss">
.breadcrumbs {
  @apply flex flex-gap-x-1 items-center text-sm overflow-auto;

  &-wrapper {
    @apply flex gap-1 items-center;
  }
}

.breadcrumb-item {
  @apply shrink-0;
}

@screen lt-lg {
  .breadcrumbs {
    @apply m-t-2px m-b-2px;
  }
}

.main-bar .breadcrumbs {
  @apply m-t-0;
}
</style>

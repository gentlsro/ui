<script setup lang="ts">
// Types
import type { ICollapseProps } from './types/collapse-props.type'

// Constants
import { COLLAPSE_DEFAULT_PROPS } from './constants/collapse-default-props.constant'

type IProps = Pick<ICollapseProps, 'title' | 'subtitle' | 'icon' | 'loading' | 'ui' | 'noExpandIcon'>
  & { isOpen: boolean }

const props = defineProps<IProps>()

defineSlots<{
  left?: () => any
  icon?: () => any
  title?: () => any
  subtitle?: () => any
  right?: () => any
  append?: () => any
  expandIcon?: () => any
}>()

// Layout
const title = computed(() => typeof props.title === 'function' ? props.title() : props.title)
const subtitle = computed(() => typeof props.subtitle === 'function' ? props.subtitle() : props.subtitle)

// Styles - Header
const headerClass = computed(() => props.ui?.headerClass?.({
  isOpen: props.isOpen,
  defaults: COLLAPSE_DEFAULT_PROPS.ui.headerClass({ isOpen: props.isOpen }),
}))

const headerStyle = computed(() => props.ui?.headerStyle?.({
  isOpen: props.isOpen,
}))

// Styles - Title
const titleClass = computed(() => props.ui?.titleClass?.({
  isOpen: props.isOpen,
  defaults: COLLAPSE_DEFAULT_PROPS.ui.titleClass({ isOpen: props.isOpen }),
}))

const titleStyle = computed(() => props.ui?.titleStyle?.({
  isOpen: props.isOpen,
}))

// Styles - Subtitle
const subtitleClass = computed(() => props.ui?.subtitleClass?.({
  isOpen: props.isOpen,
  defaults: COLLAPSE_DEFAULT_PROPS.ui.subtitleClass({ isOpen: props.isOpen }),
}))

const subtitleStyle = computed(() => props.ui?.subtitleStyle?.({
  isOpen: props.isOpen,
}))

// Styles - Expand icon
const expandIconClass = computed(() => props.ui?.expandIconClass?.({
  isOpen: props.isOpen,
  defaults: COLLAPSE_DEFAULT_PROPS.ui.expandIconClass({ isOpen: props.isOpen }),
}))

const expandIconStyle = computed(() => props.ui?.expandIconStyle?.({
  isOpen: props.isOpen,
}))

// Styles - Header right
const headerRightClass = computed(() => props.ui?.headerRightClass?.({
  isOpen: props.isOpen,
  defaults: COLLAPSE_DEFAULT_PROPS.ui.headerRightClass({ isOpen: props.isOpen }),
}))

const headerRightStyle = computed(() => props.ui?.headerRightStyle?.({
  isOpen: props.isOpen,
}))

// Styles - Text
const textClass = computed(() => props.ui?.textClass?.({
  isOpen: props.isOpen,
  defaults: COLLAPSE_DEFAULT_PROPS.ui.textClass({ isOpen: props.isOpen }),
}))

const textStyle = computed(() => props.ui?.textStyle?.({
  isOpen: props.isOpen,
}))
</script>

<template>
  <div
    class="collapse__header"
    :class="headerClass"
    :style="headerStyle"
    :data-state="isOpen ? 'open' : 'closed'"
  >
    <!-- Header left -->
    <slot name="left" />

    <!-- Header icon -->
    <slot name="icon">
      <div
        v-if="icon"
        :class="icon"
        class="collapse__header-icon"
      />
    </slot>

    <!-- Header title & subtitle -->
    <div
      class="collapse__header-text"
      :class="textClass"
      :style="textStyle"
    >
      <!-- Header title -->
      <slot name="title">
        <span
          class="collapse__header-title"
          :class="titleClass"
          :style="titleStyle"
        >
          {{ title }}
        </span>
      </slot>

      <!-- Header subtitle -->
      <slot name="subtitle">
        <span
          v-if="subtitle"
          class="collapse__header-subtitle"
          :class="subtitleClass"
          :style="subtitleStyle"
        >
          {{ subtitle }}
        </span>
      </slot>
    </div>

    <slot name="append" />

    <!-- Header right -->
    <slot
      name="right"
      :loading
    >
      <div
        class="collapse__header-right"
        :class="headerRightClass"
        :style="headerRightStyle"
      >
        <!-- Loader -->
        <LoaderBlock
          v-if="loading"
          size="h-6 w-6"
        />

        <!-- Expand icon -->
        <slot name="expandIcon">
          <div
            v-if="!noExpandIcon"
            class="expand-icon"
            :class="expandIconClass"
            :style="expandIconStyle"
          />
        </slot>
      </div>
    </slot>
  </div>
</template>

<style lang="scss" scoped>
.collapse__header {
  transition-duration: var(--transitionDuration);
  transition-timing-function: var(--transitionTimingFunction);
  transition-property: border-radius;

  &-icon {
    @apply shrink-0;
  }

  .expand-icon {
    @apply transition-transform;
  }
}
</style>

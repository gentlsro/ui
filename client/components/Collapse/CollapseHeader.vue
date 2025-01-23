<script setup lang="ts">
// Types
import type { ICollapseProps } from './types/collapse-props.type'

type IProps = Pick<ICollapseProps, 'title' | 'subtitle' | 'icon' | 'loading' | 'ui' | 'expandIcon' | 'noSeparator'>
  & { isOpen: boolean }

const props = defineProps<IProps>()

defineSlots<{
  left?: () => any
  icon?: () => any
  title?: () => any
  subtitle?: () => any
  right?: () => any
  expandIcon?: () => any
}>()

// Layout
const headerClass = computed(() => props.ui?.headerClass?.(props.isOpen))
const titleClass = computed(() => props.ui?.titleClass?.(props.isOpen))
const subtitleClass = computed(() => props.ui?.subtitleClass?.(props.isOpen))
const expandIconClass = computed(() => props.expandIcon?.(props.isOpen))

const headerStyle = computed(() => props.ui?.headerStyle?.(props.isOpen))
const titleStyle = computed(() => props.ui?.titleStyle?.(props.isOpen))
const subtitleStyle = computed(() => props.ui?.subtitleStyle?.(props.isOpen))
</script>

<template>
  <Item
    class="collapse__header"
    :class="[headerClass, { 'no-separator': noSeparator }]"
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
    <div class="collapse__header-text">
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

    <!-- Header right -->
    <slot
      name="right"
      :loading
    >
      <div class="collapse__header-right">
        <!-- Loader -->
        <LoaderBlock
          v-if="loading"
          size="h-6 w-6"
        />

        <!-- Expand icon -->
        <slot name="expandIcon">
          <div
            class="expand-icon i-majesticons:chevron-right"
            :class="[expandIconClass, { 'rotate-90deg': isOpen }]"
          />
        </slot>
      </div>
    </slot>
  </Item>
</template>

<style lang="scss" scoped>
.collapse__header {
  @apply flex items-center gap-2 p-x-2 min-h-10;

  &-icon {
    @apply shrink-0;
  }

  &-right {
    @apply flex gap-1 self-start items-center shrink-0 min-h-inherit;

    .expand-icon {
      @apply transition-transform;
    }
  }

  &-text {
    @apply flex flex-col grow p-y-2;
  }

  &-title {
    @apply overflow-auto font-rem-14 font-semibold;
  }

  &-subtitle {
    @apply text-caption leading-tight font-rem-12;
  }

  &[data-state='open'] {
    @apply rounded-b-0;

    &:not(.no-separator)::before {
      @apply content-empty absolute left-0 right-0 bottom-0 border-t-1 border-ca;
    }
  }
}
</style>

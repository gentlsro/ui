<script setup lang="ts">
// Types
import type { IMenuProps } from './types/menu-props.type'

// Store
import { useMenuStore } from './store/menu.store'

type IProps = Pick<IMenuProps, 'ui' | 'noClose'>
  & { hide: (force?: boolean) => void }

defineProps<IProps>()

// Store
const { title, virtualConfiguration } = useMenuStore()

const isMovable = computed(() => {
  return virtualConfiguration?.value?.enabled && virtualConfiguration?.value?.movable
})
</script>

<template>
  <div
    class="menu-header"
    :class="[ui?.headerClass, { 'is-movable': isMovable }]"
    :style="ui?.headerStyle"
  >
    <!-- Title -->
    <slot
      v-if="$slots.title || $slots.header || title"
      name="title"
      :hide="hide"
    >
      <h6
        class="menu-header__title"
        :class="ui?.titleClass"
        :style="ui?.titleStyle"
      >
        {{ title }}
      </h6>
    </slot>

    <slot name="header-right" />

    <!-- Close -->
    <Btn
      v-if="!noClose"
      preset="CLOSE"
      size="sm"
      self="start"
      @click="hide(true)"
    />
  </div>
</template>

<style scoped lang="scss">
.menu-header {
  @apply flex items-center gap-2 p-l-3 p-r-1 p-y-2 rounded-t-custom;

  &__title {
    @apply grow;
  }

  &.is-movable {
    @apply cursor-move;
  }
}
</style>

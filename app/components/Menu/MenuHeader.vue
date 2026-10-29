<script setup lang="ts">
// Types
import type { IMenuProps } from './types/menu-props.type'

// Constants
import { MENU_DEFAULT_PROPS } from './constants/menu-default-props.constant'

// Store
import { useMenuStore } from './store/menu.store'

type IProps = Pick<IMenuProps, 'ui' | 'noClose'>
  & { hide: (force?: boolean) => void }

const props = defineProps<IProps>()

// Store
const { title, virtualConfig } = useMenuStore()

const isMovable = computed(() => {
  return virtualConfig?.value?.enabled && virtualConfig?.value?.movable
})

// Styles - header
const headerClass = computed(() => {
  return props.ui?.headerClass?.({
    defaults: MENU_DEFAULT_PROPS.ui.headerClass(),
  })
})

const headerStyle = computed(() => {
  return props.ui?.headerStyle?.()
})

// Styles - title
const titleClass = computed(() => {
  return props.ui?.titleClass?.({
    defaults: MENU_DEFAULT_PROPS.ui.titleClass(),
  })
})

const titleStyle = computed(() => {
  return props.ui?.titleStyle?.()
})
</script>

<template>
  <div
    class="menu-header"
    :class="[headerClass, { 'is-movable': isMovable }]"
    :style="headerStyle"
  >
    <!-- Title -->
    <slot
      v-if="$slots.title || $slots.header || title"
      name="title"
      :hide="hide"
    >
      <h6
        class="menu-header__title"
        :class="titleClass"
        :style="titleStyle"
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

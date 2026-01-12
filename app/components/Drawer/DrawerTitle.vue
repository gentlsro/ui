<script setup lang="ts">
// Types
import type { IDrawerProps } from './types/drawer-props.type'

// Constants
import { DRAWER_DEFAULT_PROPS } from './constants/drawer-default-props.constant'

type IProps = Pick<IDrawerProps, 'modelValue' | 'title' | 'ui'>

const props = defineProps<IProps>()

// Styles - title
const titleClass = computed(() => {
  return props.ui?.titleClass?.({
    defaults: DRAWER_DEFAULT_PROPS.ui.titleClass(),
  })
})

const titleStyle = computed(() => {
  return props.ui?.titleStyle?.()
})

// Layout
const isOpen = defineModel<boolean>()
</script>

<template>
  <div
    class="drawer-title"
    :class="titleClass"
    :style="titleStyle"
  >
    <slot name="left" />

    <Heading
      grow
      :highlighted="false"
    >
      {{ title }}
    </Heading>

    <slot name="append" />

    <Btn
      preset="CLOSE"
      self="start"
      m="t-2"
      @click="isOpen = false"
    />

    <slot name="right" />
  </div>
</template>

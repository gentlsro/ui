<script setup lang="ts">
// Types
import type { IDrawerProps } from './types/drawer-props.type'

// Constants
import { DRAWER_LAYERED_CLASSES } from './constants/drawer-layered-classes.constant'

type IProps = Pick<IDrawerProps, 'modelValue' | 'title' | 'ui'>

const props = defineProps<IProps>()

// Styles - title
const titleClass = computed(() => {
  return props.ui?.titleClass?.({
    defaults: DRAWER_LAYERED_CLASSES.titleClass(),
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
      @click="isOpen = false"
    />

    <slot name="right" />
  </div>
</template>

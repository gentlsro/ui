<script setup lang="ts">
// Types
import type { IDrawerProps } from './types/drawer-props.type'

type IProps = Pick<IDrawerProps, 'modelValue' | 'title' | 'ui'>

defineProps<IProps>()

// Layout
const isOpen = defineModel<boolean>()
</script>

<template>
  <div
    class="drawer-title"
    :class="ui?.titleClass"
    :style="ui?.titleStyle"
  >
    <slot name="left" />

    <Heading grow>
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

<style scoped lang="scss">
.drawer-title {
  @apply flex gap-2 items-center;
}
</style>

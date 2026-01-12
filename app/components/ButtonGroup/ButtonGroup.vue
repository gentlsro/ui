<script setup lang="ts">
// Types
import type { IButtonGroupProps } from './types/button-group-props.type'

// Constants
import { BUTTON_GROUP_DEFAULT_PROPS } from './constants/button-group-default-props.constant'

const props = withDefaults(defineProps<IButtonGroupProps>(), {
  ...getComponentProps('buttonGroup'),
})

// Utils
const mergedProps = computed(() => {
  return getComponentMergedProps('buttonGroup', props)
})

// Styles - container
const containerClass = computed(() => {
  return mergedProps.value?.ui?.containerClass?.({
    defaults: BUTTON_GROUP_DEFAULT_PROPS.ui.containerClass(),
  })
})

const containerStyle = computed(() => {
  return mergedProps.value?.ui?.containerStyle?.()
})

// Styles - active button
const activeClass = computed(() => {
  return mergedProps.value?.ui?.activeClass?.({
    defaults: BUTTON_GROUP_DEFAULT_PROPS.ui.activeClass(),
  })
})

const activeStyle = computed(() => {
  return mergedProps.value?.ui?.activeStyle?.()
})
</script>

<template>
  <div
    class="btn-group group"
    :class="containerClass"
    :style="containerStyle"
  >
    <Btn
      v-for="(btn, idx) in buttons"
      :key="idx"
      v-bind="btn"
      :disabled
      disable-style="flat"
      :class="{ [activeClass]: btn.value === modelValue }"
      :style="btn.value === modelValue ? activeStyle : undefined"
    >
      <template #default>
        <slot :name="btn.value" />
      </template>
    </Btn>
  </div>
</template>

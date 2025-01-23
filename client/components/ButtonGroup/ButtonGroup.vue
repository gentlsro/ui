<script setup lang="ts">
// Types
import type { IButtonGroupProps } from './types/button-group-props.type'

// Functions
import { getComponentMergedProps, getComponentProps } from '../../functions/get-component-props'

const props = withDefaults(defineProps<IButtonGroupProps>(), {
  ...getComponentProps('buttonGroup'),
})

// Utils
const mergedProps = computed(() => {
  return getComponentMergedProps('buttonGroup', props)
})
</script>

<template>
  <div class="btn-group">
    <Btn
      v-for="(btn, idx) in buttons"
      :key="idx"
      v-bind="btn"
      :class="{ [mergedProps.ui?.activeClass]: btn.value === modelValue }"
    >
      <template #default>
        <slot :name="btn.value" />
      </template>
    </Btn>
  </div>
</template>

<style lang="scss" scoped>
.btn-group {
  @apply flex rounded-full;
}
</style>

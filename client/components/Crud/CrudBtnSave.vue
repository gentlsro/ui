<script setup lang="ts">
// Types
import type { ICrudBtnProps } from './types/crud-btn-props.type'

// Functions
import { getComponentMergedProps, getComponentProps } from '../../functions/get-component-props'

const props = withDefaults(defineProps<ICrudBtnProps>(), {
  ...getComponentProps('crudBtns'),
})

defineEmits<{
  (e: 'save'): void
}>()

// Utils
const mergedProps = computed(() => {
  return getComponentMergedProps('crudBtns', props)
})

// Layout
const label = computed(() => {
  if (props.noLabel) {
    return
  }

  return props.label ?? $t('general.add')
})
</script>

<template>
  <Btn
    preset="SAVE"
    :label
    :loading
    :disabled
    v-bind="mergedProps.btnProps"
    @click="$emit('save')"
  />
</template>

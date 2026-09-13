<script setup lang="ts" vapor>
// Types
import type { ICrudBtnProps, ICrudBtnsProps } from './types/crud-btn-props.type'

const props = withDefaults(defineProps<ICrudBtnProps>(), {
  loading: (getComponentProps('crudBtns') as ICrudBtnsProps).loading,
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

  return props.label === false || props.label == null
    ? $t('general.save')
    : props.label
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

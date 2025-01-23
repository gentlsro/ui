<script setup lang="ts">
// Types
import type { ICrudBtnProps } from './types/crud-btn-props.type'

// Functions
import { getComponentMergedProps, getComponentProps } from '../../functions/get-component-props'

type IProps = ICrudBtnProps & {
  to?: any // should be RouteLocationRaw but that breaks some projects for whatever reason
}

const props = withDefaults(defineProps<IProps>(), {
  ...getComponentProps('crudBtns'),
})

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
    preset="ADD"
    bg="primary"
    color="!white"
    :label
    :loading
    :disabled
    v-bind="mergedProps.btnProps"
    data-cy="add-button"
  />
</template>

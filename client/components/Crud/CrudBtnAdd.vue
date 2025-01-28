<script setup lang="ts">
import type { RouteLocationRaw } from '#vue-router'

// Types
import type { ICrudBtnProps } from './types/crud-btn-props.type'

// Functions
import { getComponentMergedProps, getComponentProps } from '../../functions/get-component-props'

type IProps = ICrudBtnProps & {
  to?: RouteLocationRaw
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
    :to
    data-cy="add-button"
  />
</template>

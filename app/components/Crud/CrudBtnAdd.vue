<script setup lang="ts" vapor>
import type { NavigationTarget } from '../../types/navigation-target.type'

// Types
import type { ICrudBtnProps, ICrudBtnsProps } from './types/crud-btn-props.type'

type IProps = ICrudBtnProps & {
  to?: NavigationTarget
}

const props = withDefaults(defineProps<IProps>(), {
  loading: (getComponentProps('crudBtns') as ICrudBtnsProps).loading,
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

  return props.label === false || props.label == null
    ? $t('general.add')
    : props.label
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

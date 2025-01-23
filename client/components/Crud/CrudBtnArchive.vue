<script setup lang="ts">
// Types
import type { ICrudBtnProps } from './types/crud-btn-props.type'

// Functions
import { getComponentMergedProps, getComponentProps } from '../../functions/get-component-props'

type IProps = ICrudBtnProps & { isArchived?: boolean }

const props = withDefaults(defineProps<IProps>(), {
  ...getComponentProps('crudBtns'),
})

defineEmits<{
  (e: 'archive'): void
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

  if (props.label) {
    return props.label
  }

  return props.isArchived
    ? $t('general.restore')
    : $t('general.archive')
})
</script>

<template>
  <Btn
    :preset="isArchived ? 'RESTORE' : 'ARCHIVE'"
    :label
    :loading
    :disabled
    v-bind="mergedProps.btnProps"
  >
    <MenuConfirmation
      placement="bottom"
      :title="label"
      @ok="$emit('archive')"
    >
      <slot name="confirmation" />
    </MenuConfirmation>
  </Btn>
</template>

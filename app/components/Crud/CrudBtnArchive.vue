<script setup lang="ts" vapor>
// Types
import type { ICrudBtnProps, ICrudBtnsProps } from './types/crud-btn-props.type'

type IProps = ICrudBtnProps & { isArchived?: boolean }

const props = withDefaults(defineProps<IProps>(), {
  loading: (getComponentProps('crudBtns') as ICrudBtnsProps).loading,
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

const btnEl = useTemplateRef<{ element?: HTMLElement }>('btnEl')
const menuTarget = () => btnEl.value?.element
</script>

<template>
  <Btn
    ref="btnEl"
    :preset="isArchived ? 'RESTORE' : 'ARCHIVE'"
    :label
    :loading
    :disabled
    v-bind="mergedProps.btnProps"
  />

  <MenuConfirmation
    :target="menuTarget"
    :reference-target="menuTarget"
    placement="bottom"
    :title="label"
    @ok="$emit('archive')"
  >
    <slot name="confirmation" />
  </MenuConfirmation>
</template>

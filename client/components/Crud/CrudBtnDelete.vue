<script setup lang="ts">
import type { CSSProperties } from 'vue'
import type { ICrudBtnProps } from './types/crud-btn-props.type'
import type { IMenuProps } from '../Menu/types/menu-props.type'
import { getComponentMergedProps, getComponentProps } from '../../functions/get-component-props'

type IProps = ICrudBtnProps & {
  noConfirm?: boolean
  confirmationText?: string
  menuProps?: IMenuProps & { class?: ClassType, style?: CSSProperties }
}

const props = withDefaults(defineProps<IProps>(), {
  ...getComponentProps('crudBtns'),
})

defineEmits<{
  (e: 'delete'): void
  (e: 'hide'): void
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

  return props.label
})
</script>

<template>
  <Btn
    preset="TRASH"
    :label
    :loading
    :disabled
    v-bind="mergedProps.btnProps"
    tabindex="-1"
    data-cy="delete-button"
    @click="noConfirm && $emit('delete')"
  >
    <MenuConfirmation
      v-if="!noConfirm"
      :title="$t('general.delete')"
      placement="bottom-start"
      focus-confirm-button
      :confirmation-text
      h="auto"
      v-bind="menuProps"
      @hide="$emit('hide')"
      @ok="$emit('delete')"
    >
      <slot name="confirmation" />
    </MenuConfirmation>

    <slot />
  </Btn>
</template>

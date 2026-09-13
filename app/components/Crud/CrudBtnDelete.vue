<script setup lang="ts" vapor>
import type { CSSProperties } from 'vue'

// Types
import type { ICrudBtnProps, ICrudBtnsProps } from './types/crud-btn-props.type'
import type { IMenuConfirmationProps } from '../MenuConfirmation/types/menu-confirmation-props.type'

type IProps = ICrudBtnProps & {
  noConfirm?: boolean
  confirmationText?: string
  menuProps?: IMenuConfirmationProps & { class?: ClassType, style?: CSSProperties }
}

const props = withDefaults(defineProps<IProps>(), {
  loading: (getComponentProps('crudBtns') as ICrudBtnsProps).loading,
})

defineEmits<{
  (e: 'delete'): void
  (e: 'show'): void
  (e: 'hide'): void
  (e: 'before-show'): void
  (e: 'before-hide'): void
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
    ? $t('general.delete')
    : props.label
})

const btnEl = useTemplateRef<{ element?: HTMLElement }>('btnEl')
const menuTarget = () => btnEl.value?.element
</script>

<template>
  <Btn
    ref="btnEl"
    preset="TRASH"
    :label
    :loading
    :disabled
    v-bind="mergedProps.btnProps"
    tabindex="-1"
    data-cy="delete-button"
    @click="noConfirm && $emit('delete')"
  >
    <slot />
  </Btn>

  <MenuConfirmation
    v-if="!noConfirm"
    :target="menuTarget"
    :reference-target="menuTarget"
    :title="$t('general.delete')"
    placement="bottom-start"
    focus-confirm-button
    :confirmation-text
    h="auto"
    v-bind="menuProps"
    @show="$emit('show')"
    @before-show="$emit('before-show')"
    @hide="$emit('hide')"
    @before-hide="$emit('before-hide')"
    @ok="$emit('delete')"
  >
    <slot name="confirmation" />
  </MenuConfirmation>
</template>

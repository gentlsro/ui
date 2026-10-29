<script setup lang="ts">
import { useFormStore } from './stores/form.store'

// Types
import type { IFormProps } from './types/form-props.type'

// Constants
import { FORM_DEFAULT_PROPS } from './constants/form-default-props.constant'

type IProps = {}
  & Pick<
    IFormProps,
    | 'label' | 'ui' | 'noSubmit' | 'submitBtnProps' | 'noEditControls' | 'cancelBtnProps' | 'editDisabled'
    | 'submitConfirmationText' | 'icon' | 'editControls' | 'labelForcedVisibility' | 'editBtnProps'
  >
  & { hasKeyboardShortcuts: boolean, hasConfirmation: boolean, submit?: Function }

const props = defineProps<IProps>()

// Store
const {
  isEditing,
  confirmationEl,
  isLoading,
  isSubmitDisabled,
  handleSubmit,
} = useFormStore()

// Layout
const editControls = computed(() => {
  if (props.noEditControls || !props.editControls) {
    return
  }

  return {
    cancel: props.editControls === true || props.editControls?.cancel,
    edit: props.editControls === true || props.editControls?.edit,
  }
})

// Styles - submit wrapper
const submitWrapperClass = computed(() => {
  return props.ui?.submitWrapperClass?.({
    defaults: FORM_DEFAULT_PROPS.ui.submitWrapperClass(),
  })
})

const submitWrapperStyle = computed(() => {
  return props.ui?.submitWrapperStyle?.()
})

// Styles - submit
const submitClass = computed(() => {
  return props.ui?.submitClass?.({
    defaults: FORM_DEFAULT_PROPS.ui.submitClass(),
  })
})

const submitStyle = computed(() => {
  return props.ui?.submitStyle?.()
})

// Styles - cancel
const cancelClass = computed(() => {
  return props.ui?.cancelClass?.({
    defaults: FORM_DEFAULT_PROPS.ui.cancelClass(),
  })
})

const cancelStyle = computed(() => {
  return props.ui?.cancelStyle?.()
})
</script>

<template>
  <div
    class="form__controls-submit-wrapper"
    :class="submitWrapperClass"
    :style="submitWrapperStyle"
  >
    <!-- Cancel button -->
    <CrudBtnCancel
      v-if="editControls?.cancel"
      v-bind="cancelBtnProps"
      v-model:is-editing="isEditing"
      :class="[cancelClass, { invisible: !isEditing }]"
      :style="cancelStyle"
      data-onboarding="form-cancel-btn"
    >
      <KeyboardShortcut
        v-if="hasKeyboardShortcuts"
        char="E"
        with-ctrl
        class="!absolute top--1 right-1"
      />
    </CrudBtnCancel>

    <slot name="prepend" />

    <!-- Submit button -->
    <Btn
      v-if="!noSubmit"
      :class="[submitClass, { invisible: !isEditing && !!editControls }]"
      :style="submitStyle"
      :disabled="isSubmitDisabled"
      :loading="isLoading"
      :label="label ?? $t('general.submit')"
      v-bind="submitBtnProps"
      :icon
      type="submit"
      data-cy="save-button"
      data-onboarding="form-save-btn"
    >
      <slot name="confirmation">
        <MenuConfirmation
          v-if="hasConfirmation"
          ref="confirmationEl"
          manual
          :confirmation-text="submitConfirmationText"
          placement="top"
          @ok="handleSubmit(true, $event)"
        >
          <template #append>
            <slot name="confirmation" />
          </template>
        </MenuConfirmation>
      </slot>

      <slot name="submit-btn-inner" />

      <KeyboardShortcut
        v-if="hasKeyboardShortcuts"
        with-ctrl
        char="&#9166;"
        class="!absolute top--1 right-1"
      />
    </Btn>

    <slot name="append" />

    <!-- Edit button (absolutely positioned) -->
    <CrudEditBtn
      v-if="editControls?.edit"
      v-model:is-editing="isEditing"
      :btn-props="editBtnProps"
      :disabled="editDisabled"
    >
      <KeyboardShortcut
        v-if="hasKeyboardShortcuts"
        char="E"
        class="!absolute top--1 right-1"
      />
    </CrudEditBtn>
  </div>
</template>

<script setup lang="ts">
import { useFormStore } from './stores/form.store'

// Types
import type { IFormProps } from './types/form-props.type'

type IProps = {}
  & Pick<
    IFormProps,
    | 'label' | 'ui' | 'noSubmit' | 'submitBtnProps' | 'noEditControls' | 'cancelBtnProps'
    | 'submitConfirmationText' | 'icon' | 'editControls' | 'labelForcedVisibility'
  >
  & { hasKeyboardShortcuts: boolean, hasConfirmation: boolean, submit?: Function }

const props = defineProps<IProps>()

// Store
const formStore = useFormStore()
const { isEditing, confirmationEl, isLoading, isSubmitDisabled } = storeToRefs(formStore)

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
</script>

<template>
  <div
    relative
    class="form__controls-submit-wrapper"
    :class="ui?.submitWrapperClass"
  >
    <!-- Cancel button -->
    <CrudBtnCancel
      v-if="editControls?.cancel"
      v-bind="cancelBtnProps"
      v-model:is-editing="isEditing"
      :class="[ui?.cancelClass, { invisible: !isEditing }]"
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
      :class="[
        ui?.submitClass,
        { invisible: !isEditing && !!editControls },
      ]"
      :disabled="isSubmitDisabled"
      :loading="isLoading"
      :icon
      :label="label ?? $t('general.submit')"
      v-bind="submitBtnProps"
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
          @ok="formStore.handleSubmit(true, $event)"
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
    >
      <KeyboardShortcut
        v-if="hasKeyboardShortcuts"
        char="E"
        class="!absolute top--1 right-1"
      />
    </CrudEditBtn>
  </div>
</template>

<style lang="scss" scoped>
.form__controls-submit-wrapper {
  @apply flex gap-2;
}
</style>

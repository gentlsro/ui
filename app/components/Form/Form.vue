<script setup lang="ts">
import { getActivePinia } from 'pinia'

// Types
import type { IFormProps } from './types/form-props.type'

// Constants
import { FORM_DEFAULT_PROPS } from './constants/form-default-props.constant'

// Functions
import { useForm } from './composables/useForm'
import { useFormUtils } from './composables/useFormUtils'

// Store
import { FORM_ID_KEY, useFormStore } from './stores/form.store'

// Provide / Inject
import { formSubmitKey } from './provide/form.provide'

const props = withDefaults(defineProps<IFormProps>(), {
  ...getComponentProps('form'),
})

const emits = defineEmits<{
  (e: 'submit', payload?: any): void
  (e: 'cancel'): void
  (e: 'confirmation'): void
  (e: 'update:errors', errors: string[]): void
}>()

// Init
const uuid = generateUUID()
provideLocal(FORM_ID_KEY, uuid)

// Utils
const { getFormControlsProps } = useFormUtils()

const mergedProps = computed(() => {
  return getComponentMergedProps('form', props)
})

// Store
const { lastPointerDownType } = storeToRefs(useUIStore())
const {
  formEl,
  isEditing,
  errors,
  hasConfirmation,
  emits: storeEmits,
  handleSubmit,
} = useFormStore({ formProps: props })

// Set emits

storeEmits.value.submit = (payload: any) => emits('submit', payload)
storeEmits.value.cancel = () => emits('cancel')
storeEmits.value.confirmation = () => emits('confirmation')

// State
const formControlsProps = getFormControlsProps(props)

// When no controls are available, we put the editing mode active
if (props.noControls || props.noEditControls || !props.editControls) {
  isEditing.value = true
}

// Layout
const { hasKeyboardShortcuts, handleEnter } = useForm(props)

const classes = computed(() => {
  return {
    'is-label-forced-visible': props.labelForcedVisibility,
  }
})

function handleFocusFirstInput() {
  focusFirstInput({ el: formEl.value, lastPointerDownType: lastPointerDownType.value })
}

// When triggering the edit mode, we want to focus the first input
watch(isEditing, isEditing => {
  // Potentially focus the first input
  if (isEditing) {
    // We need a timeout to
  // 1. Wait for the form to be rendered
  // 2. Potentially prevent the `e` key being inputted into the input

    if (props.focusFirstInput) {
      setTimeout(() => handleFocusFirstInput())
    }
  } else {
    emits('cancel')
  }
})

// We also try to focus the first input when the form is mounted
onMounted(() => {
  if (props.focusFirstInput) {
    setTimeout(() => handleFocusFirstInput())
  }
})

// We provide the form submit key
provide(formSubmitKey, handleSubmit)

// Styles - container
const containerClass = computed(() => {
  return mergedProps.value?.ui?.containerClass?.({
    defaults: FORM_DEFAULT_PROPS.ui.containerClass(),
  })
})

const containerStyle = computed(() => {
  return mergedProps.value?.ui?.containerStyle?.()
})

// Styles - content
const contentClass = computed(() => {
  return mergedProps.value?.ui?.contentClass?.({
    defaults: FORM_DEFAULT_PROPS.ui.contentClass(),
  })
})

const contentStyle = computed(() => {
  return mergedProps.value?.ui?.contentStyle?.()
})

// Styles - controls
const controlsClass = computed(() => {
  return mergedProps.value?.ui?.controlsClass?.({
    defaults: FORM_DEFAULT_PROPS.ui.controlsClass(),
  })
})

const controlsStyle = computed(() => {
  return mergedProps.value?.ui?.controlsStyle?.()
})
</script>

<template>
  <form
    ref="formEl"
    class="form"
    :class="[classes, containerClass]"
    :style="containerStyle"
    autocomplete="off"
    novalidate
    .handleEnter="handleEnter"
    @submit.stop.prevent="handleSubmit()"
    @keydown.enter="handleEnter"
  >
    <slot name="above" />

    <div
      class="form__content"
      :class="contentClass"
      :style="contentStyle"
    >
      <slot :submit="handleSubmit" />
    </div>

    <slot name="errors">
      <FormErrors
        v-model="errors"
        :errors-section-props="mergedProps.errorsSectionProps"
      />
    </slot>

    <slot
      v-if="!noControls && hasControls !== false"
      name="controls"
      :submit="handleSubmit"
      :ui="mergedProps.ui"
      :has-keyboard-shortcuts
      :has-confirmation
      :cancel-btn-props="mergedProps.cancelBtnProps"
      :submit-btn-props="mergedProps.submitBtnProps"
      :edit-btn-props="mergedProps.editBtnProps"
    >
      <div
        id="form-controls"
        class="form__controls"
        :class="controlsClass"
        :style="controlsStyle"
      >
        <slot name="controls-start" />

        <FormControls
          v-bind="formControlsProps"
          :ui="mergedProps.ui"
          :has-confirmation
          :has-keyboard-shortcuts
          :cancel-btn-props="mergedProps.cancelBtnProps"
          :submit-btn-props="mergedProps.submitBtnProps"
          :edit-btn-props="mergedProps.editBtnProps"
        >
          <template #prepend>
            <slot name="submit-prepend" />
          </template>

          <template #append>
            <slot name="submit-append" />
          </template>
        </FormControls>
      </div>
    </slot>
  </form>
</template>

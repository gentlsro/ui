<script setup lang="ts">
// Types
import type { IFormProps } from './types/form-props.type'

// Functions
import { useForm } from './composables/useForm'
import { useFormUtils } from './composables/useFormUtils'
import { focusFirstInput } from '../../functions/focus-first-input'
import { getComponentMergedProps, getComponentProps } from '../../functions/get-component-props'

// Store
import { formIdKey, useFormStore } from './stores/form.store'

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
const uuid = useId()

provideLocal(formIdKey, uuid)

// Utils
const { getFormControlsProps } = useFormUtils()

const mergedProps = computed(() => {
  return getComponentMergedProps('form', props)
})

// Store
const { lastPointerDownType } = storeToRefs(useUIStore())
const formStore = useFormStore({ props })
const {
  formEl,
  isEditing: storeIsEditing,
  isLoading: storeIsLoading,
  isSubmitDisabled: storeIsSubmitDisabled,
  isSubmitConfirmation: storeIsSubmitConfirmation,
  errors: storeErrors,
  hasConfirmation,
  emitSubmit,
  emitCancel,
  emitConfirmation,
} = storeToRefs(formStore)

// Set emits
emitSubmit.value = payload => emits('submit', payload)
emitCancel.value = () => emits('cancel')
emitConfirmation.value = () => emits('confirmation')

// State
const isEditing = defineModel<boolean>('isEditing', { default: false })
const errors = defineModel<IFormProps['errors']>('errors', { default: () => [] })
const isLoading = toRef(props, 'loading')
const isSubmitDisabled = toRef(props, 'submitDisabled')
const isSubmitConfirmation = toRef(props, 'submitConfirmation')
const formControlsProps = getFormControlsProps(props)

// When no controls are available, we put the editing mode active
if (props.noControls || props.noEditControls || !props.editControls) {
  isEditing.value = true
}

// Layout
const { hasKeyboardShortcuts, handleEnter } = useForm(props)

const classes = computed(() => {
  return {
    container: [
      mergedProps.value.ui?.containerClass,
      {
        'form--dense': props.dense,
        'is-label-forced-visible': props.labelForcedVisibility,
      },
    ],
    content: mergedProps.value.ui?.contentClass,
    controls: mergedProps.value.ui?.controlsClass,
  }
})

const styles = computed(() => {
  return {
    container: mergedProps.value.ui?.containerStyle,
    content: mergedProps.value.ui?.contentStyle,
    controls: mergedProps.value.ui?.controlsStyle,
  }
})

function handleFocusFirstInput() {
  focusFirstInput({ el: formEl.value, lastPointerDownType: lastPointerDownType.value })
}

// Sync with store
syncRef(isEditing, storeIsEditing, { direction: 'both' })
syncRef(errors, storeErrors, { direction: 'both' })
syncRef(isLoading, storeIsLoading, { direction: 'ltr' })
syncRef(isSubmitDisabled, storeIsSubmitDisabled, { direction: 'ltr' })
syncRef(isSubmitConfirmation, storeIsSubmitConfirmation, { direction: 'ltr' })

// When triggering the edit mode, we want to focus the first input
watch(isEditing, isEditing => {
  // Potentially focus the first input
  if (isEditing) {
    // We need a timeout to
  // 1. Wait for the form to be rendered
  // 2. Potentially prevent the `e` key being inputted into the input
    setTimeout(() => handleFocusFirstInput())
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
provide(formSubmitKey, formStore.handleSubmit)
</script>

<template>
  <form
    ref="formEl"
    class="form"
    :class="classes.container"
    :style="styles.container"
    autocomplete="off"
    novalidate
    .handleEnter="handleEnter"
    @submit.stop.prevent="formStore.handleSubmit()"
    @keydown.enter="handleEnter"
  >
    <slot name="above" />

    <div
      class="form__content"
      :class="classes.content"
      :style="styles.content"
    >
      <slot :submit="formStore.handleSubmit" />
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
      :submit="formStore.handleSubmit"
      :ui="mergedProps.ui"
      :has-keyboard-shortcuts
      :has-confirmation
      :cancel-btn-props="mergedProps.cancelBtnProps"
      :submit-btn-props="mergedProps.submitBtnProps"
    >
      <div
        id="form-controls"
        class="form__controls"
        :class="classes.controls"
        :style="styles.controls"
      >
        <slot name="controls-start" />

        <FormControls
          v-bind="formControlsProps"
          :ui="mergedProps.ui"
          :has-confirmation
          :has-keyboard-shortcuts
          :cancel-btn-props="mergedProps.cancelBtnProps"
          :submit-btn-props="mergedProps.submitBtnProps"
        />
      </div>
    </slot>
  </form>
</template>

<style lang="scss" scoped>
.form {
  &--dense {
    .form__content {
      @apply p-0;
    }
  }

  &__content {
    @apply flex-gap-2 border-ca;
  }

  &__controls {
    @apply flex gap-2 items-center shrink-0;
  }
}
</style>

import { skipHydrate } from 'pinia'

// Types
import type { IFormProps } from '../types/form-props.type'

// Functions
import { blurAnyFocusedInput } from '$utilsLayer/client/functions/blur-any-focused-input'
import { formHasConfirmation } from '../functions/form-has-confirmation'

// Components
import type MenuConfirmation from '../../MenuConfirmation/MenuConfirmation.vue'

export const formIdKey = Symbol('__formId')

export function useFormStore(payload?: {
  id?: string
  props?: Partial<IFormProps>
}) {
  const { id, props } = payload ?? {}
  const _formId = injectLocal(formIdKey, id ?? useId())

  return defineStore(`form.${_formId}`, () => {
    // Store
    const { uiState } = storeToRefs(useUIStore())

    // Helpers
    const emitSubmit = ref<(payload: any) => void>(() => {})
    const emitCancel = ref<() => void>(() => {})
    const emitConfirmation = ref<() => void>(() => {})

    // Layout
    const formEl = ref<HTMLFormElement>()
    const confirmationEl = ref<InstanceType<typeof MenuConfirmation>>()
    const isEditing = ref(!!props?.isEditing)
    const isLoading = ref()
    const isSubmitDisabled = ref()
    const isSubmitConfirmation = ref()

    const hasConfirmation = computed(() => {
      return formHasConfirmation(isSubmitConfirmation.value, uiState.value.form?.confirmation.enabled)
    })

    // Errors
    const errors = ref<IFormProps['errors']>(props?.errors ?? [])

    // Methods
    async function handleSubmit(isConfirmed?: boolean, payload?: any) {
      if (!isEditing.value) {
        return
      }

      if (!isConfirmed && hasConfirmation.value) {
        blurAnyFocusedInput()

        console.log('FUCK', confirmationEl.value)

        // We try to show the default confirmation menu
        if (confirmationEl.value) {
          confirmationEl.value?.show?.()
          nextTick(() => confirmationEl.value?.focusConfirmButton?.())
        }

        // Otherwise, we emit an event
        else {
          emitConfirmation.value()
        }

        return
      }

      if (!isLoading.value && !isSubmitDisabled.value) {
        emitSubmit.value(payload)
      }
    }

    const throttledSubmit = useThrottleFn(handleSubmit, 500, false, true)

    return {
      isEditing,
      isSubmitDisabled,
      isSubmitConfirmation,
      errors,
      formEl,
      isLoading,
      confirmationEl,
      hasConfirmation,
      emitSubmit: skipHydrate(emitSubmit),
      emitCancel: skipHydrate(emitCancel),
      emitConfirmation: skipHydrate(emitConfirmation),

      handleSubmit: skipHydrate(throttledSubmit),
    }
  })()
}

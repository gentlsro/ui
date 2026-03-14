// Types
import type { IFormProps } from '../types/form-props.type'

// Functions
import { formHasConfirmation } from '../functions/form-has-confirmation'

// Components
import type MenuConfirmation from '../../MenuConfirmation/MenuConfirmation.vue'

type IConfig = {
  formProps?: IFormProps
  injectionKey?: string
}

export const FORM_ID_KEY = Symbol('__formId')

function createStore(injectionKey?: string) {
  const injectionState = createInjectionState((payload?: IConfig) => {
    const { formProps } = payload ?? {}

    // Utils
    const instance = getCurrentInstance()

    // Store
    const { uiState } = storeToRefs(useUIStore())

    // Layout
    const formEl = ref<HTMLFormElement>()
    const isSubmitPrevented = refAutoReset(false, 50)
    const confirmationEl = ref<InstanceType<typeof MenuConfirmation>>()

    const isEditing = initRef({
      propName: 'isEditing',
      instance,
      props: formProps,
      defaultValue: false,
    }) as Ref<boolean>

    const isLoading = initRef({
      propName: 'loading',
      instance,
      props: formProps,
      defaultValue: false,
    }) as Ref<boolean>

    const isSubmitDisabled = initRef({
      propName: 'submitDisabled',
      instance,
      props: formProps,
      defaultValue: false,
    }) as Ref<boolean>

    const isSubmitConfirmation = initRef({
      propName: 'submitConfirmation',
      instance,
      props: formProps,
      defaultValue: false,
    }) as Ref<boolean>

    const hasConfirmation = computed(() => {
      return formHasConfirmation(
        isSubmitConfirmation.value,
        uiState.value.form?.confirmation.enabled,
      )
    })

    // Errors
    const errors = initRef({
      propName: 'errors',
      instance,
      props: formProps,
      defaultValue: [],
    }) as Ref<IFormProps['errors']>

    // Methods
    async function handleSubmit(isConfirmed?: boolean, payload?: any) {
      if (!isEditing.value) {
        return
      }

      if (!isConfirmed) {
        blurFocusedInput()

        // We try to show the default confirmation menu
        if (confirmationEl.value && hasConfirmation.value) {
          confirmationEl.value?.show?.()
          nextTick(() => confirmationEl.value?.focusConfirmButton?.())

          return
        }

        // Otherwise, we emit an event
        else if (hasConfirmation.value) {
          emits.value.confirmation()

          return
        }
      }

      if (!isLoading.value && !isSubmitDisabled.value && !isSubmitPrevented.value) {
        emits.value.submit?.(payload)
      }
    }

    const throttledSubmit = useThrottleFn(handleSubmit, 500, false, true)

    // Emits
    const emits = ref({
      submit: (payload: any) => {},
      cancel: () => {},
      confirmation: () => {},
    })

    const returnedData = {
      // Layout
      formEl,
      confirmationEl,
      isEditing,
      isLoading,
      isSubmitPrevented,
      isSubmitDisabled,
      isSubmitConfirmation,
      hasConfirmation,

      // Errors
      errors,

      // Methods
      handleSubmit,
      throttledSubmit,

      // Emits
      emits,
    }

    return returnedData
  }, { injectionKey })

  return injectionState
}

export function useFormStore(payload?: IConfig) {
  let injectionKey = payload?.injectionKey ?? injectLocal(FORM_ID_KEY)

  if (!injectionKey) {
    const uuid = generateUUID()
    provideLocal(FORM_ID_KEY, uuid)
    injectionKey = uuid
  }

  const [useProvideFormStore, useConsumeFormStore] = createStore(injectionKey)!

  return useConsumeFormStore() ?? useProvideFormStore(payload)
}

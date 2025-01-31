// Types
import type { IFormProps } from '../types/form-props.type'

// Functions
import { useFormStore } from '../stores/form.store'
import { formHasKeyboardShortcuts } from '../functions/form-has-keyboard-shortcuts'

export function useForm(props: IFormProps) {
  const uiStore = useUIStore()
  const { activeElement, uiState } = storeToRefs(uiStore)
  const formStore = useFormStore()
  const { isEditing, confirmationEl } = storeToRefs(formStore)

  // Layout
  const preventSubmitOnEnter = toRef(props, 'preventSubmitOnEnter')
  const noShortcuts = toRef(props, 'noShortcuts')

  function handleEnter(ev: KeyboardEvent) {
    const isCtrlKey = ev.ctrlKey || ev.metaKey
    const isInput = activeElement.value?.tagName === 'INPUT'
    const hasCustomEnterHandler = activeElement.value?.classList.contains('custom-enter')

    const isInputWithCustomEnterHandler = isInput && hasCustomEnterHandler

    if (
      preventSubmitOnEnter.value
      && isInput
      && !isCtrlKey
      && !isInputWithCustomEnterHandler
    ) {
      ev.preventDefault()
    } else if (isCtrlKey && !props.submitDisabled) {
      activeElement.value?.blur?.()
      formStore.handleSubmit()
    }
  }

  const hasKeyboardShortcuts = computed(() => {
    console.log(props, noShortcuts.value)

    return formHasKeyboardShortcuts(
      !noShortcuts.value,
      uiState.value.general?.keyboardShortcuts,
    )
  })

  // Keyboard shortcuts
  onKeyStroke(['e', 'E'], ev => {
  // When using CTRL or META, we return back to readonly mode
    const isControlKey = ev.ctrlKey || ev.metaKey

    if (isControlKey) {
      ev.preventDefault()
      isEditing.value = false
      confirmationEl.value?.hide()
      activeElement.value?.blur?.()
      props.reset?.()

      return
    }

    // When `e` is pressed, we want to enter the edit mode
    const isFocusedInInput = uiStore.isActiveElementInput()

    if (isFocusedInInput) {
      return
    }

    isEditing.value = true
  })

  return {
    hasKeyboardShortcuts,
    handleEnter,
  }
}

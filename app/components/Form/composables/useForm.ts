// Types
import type { IFormProps } from '../types/form-props.type'

// Functions
import { useFormStore } from '../stores/form.store'
import { formHasKeyboardShortcuts } from '../functions/form-has-keyboard-shortcuts'

export function useForm(props: IFormProps) {
  const uiStore = useUIStore()
  const { activeElement, uiState } = storeToRefs(uiStore)
  const { isEditing, confirmationEl, isSubmitPrevented, handleSubmit } = useFormStore()

  // Layout
  const preventSubmitOnEnter = toRef(props, 'preventSubmitOnEnter')
  const noShortcuts = toRef(props, 'noShortcuts')
  const noEnter = toRef(props, 'noEnter')

  function handleEnter(ev: KeyboardEvent) {
    const isCtrlKey = ev.ctrlKey || ev.metaKey
    const isInput = activeElement.value?.tagName === 'INPUT'
    const hasCustomEnterHandler = activeElement.value?.classList.contains('custom-enter')

    const isInputWithCustomEnterHandler = isInput && hasCustomEnterHandler

    if (noEnter.value) {
      isSubmitPrevented.value = true

      return
    }

    if (
      preventSubmitOnEnter.value
      && isInput
      && !isCtrlKey
      && !isInputWithCustomEnterHandler
    ) {
      ev.preventDefault()
    } else if (isCtrlKey && !props.submitDisabled) {
      activeElement.value?.blur?.()
      handleSubmit()
    }
  }

  const hasKeyboardShortcuts = computed(() => {
    return formHasKeyboardShortcuts(
      noShortcuts.value,
      !uiState.value.general?.keyboardShortcuts,
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

    // When `e` is pressed, we want to enter the edit mode, but only when the edit button is shown and enabled
    const isFocusedInInput = uiStore.isActiveElementInput()
    const editControls = props.editControls
    const isEditBtnShown = !props.noControls
      && props.hasControls !== false
      && !props.noEditControls
      && (editControls === true || (!!editControls && editControls.edit))

    if (isFocusedInInput || !isEditBtnShown || props.editDisabled) {
      return
    }

    isEditing.value = true
  })

  return {
    hasKeyboardShortcuts,
    handleEnter,
  }
}

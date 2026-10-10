import { escape } from 'lodash-es'

// Types
import type { IInputWrapperProps } from '../../InputWrapper/types/input-wrapper-props.type'

export function useInputValidationUtils(props: IInputWrapperProps) {
  const path = computed(() => {
    if (props.validationPath) {
      if (typeof props.validationPath === 'string') {
        return props.validationPath
      }

      return props.validationPath?.path
    }

    if (props.validation) {
      return props.validation.path
    }

    return ''
  })

  const { validation } = props.validation
    ? { validation: undefined } as any
    : useValidationResult({
        ...(props.validationPath
          && typeof props.validationPath === 'object'
          && { scope: props.validationPath?.scope }
        ),
      })

  const validationResult = computed(() => {
    if (!path.value) {
      return undefined
    }

    return props.validation ?? validation.getMeta(path.value)
  })

  const isRequired = computed(() => {
    return validationResult.value?.isRequired
  })

  const issues = computed(() => {
    // Errors passed by the parent are always shown; validation messages once the validation is visible.
    // The error container renders HTML, and the parent's errors can carry server or user text, so they are escaped
    const errors = props.errors?.filter(Boolean).map(error => escape(error)) ?? []
    const msgs = validationResult.value?.isValidationVisible
      ? validationResult.value.messages ?? []
      : []

    return [...errors, ...msgs]
  })

  return {
    isRequired,
    issues,
    path,
  }
}

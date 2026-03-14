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
    const msgs = validationResult.value?.messages ?? []

    if (validationResult.value?.isValidationVisible) {
      return msgs
    }

    return []
  })

  return {
    isRequired,
    issues,
    path,
  }
}

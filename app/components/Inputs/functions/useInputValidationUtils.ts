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

  const arkResult = computed(() => {
    if (!path.value) {
      return undefined
    }

    return props.validation ?? validation.getMeta(path.value, { includeChildren: true })
  })

  const isRequired = computed(() => {
    return arkResult.value?.isRequired
  })

  const issues = computed(() => {
    const msgs = arkResult.value?.messages ?? []

    if (arkResult.value?.isValidationVisible) {
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

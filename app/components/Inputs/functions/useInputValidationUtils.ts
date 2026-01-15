// Types
import type { IInputWrapperProps } from '../../InputWrapper/types/input-wrapper-props.type'

export function useInputValidationUtils(props: IInputWrapperProps) {
  const path = computed(() => {
    if (props.ark) {
      if (typeof props.ark === 'string') {
        return props.ark
      }

      return props.ark?.path
    }

    if (props.validation) {
      return props.validation.path
    }

    return ''
  })

  const { $v } = props.validation
    ? { $v: undefined } as any
    : useArk({
        scope: typeof props.ark === 'string' ? undefined : props.ark?.scope,
      })

  const arkResult = computed(() => {
    return props.validation ?? $v.getMeta(path.value)
  })

  const isRequired = computed(() => {
    return arkResult.value.isRequired
  })

  const issues = computed(() => {
    if (arkResult.value.isValidationVisible) {
      return arkResult.value.messages
    }

    return []
  })

  return {
    isRequired,
    issues,
    path,
  }
}

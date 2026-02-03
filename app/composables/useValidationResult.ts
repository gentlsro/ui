import type { Type } from 'arktype'

// Store
import { useValidationStore } from '../stores/validation.store'
import type { ExtendedError } from '../stores/validation.store'

// Utils
import { isFieldRequired } from '../functions/is-field-required'

type IPayload = {
  scope?: string
}

type IArkResult = {
  path?: string
  isRequired: boolean
  message: string
  messages: string[]
  errors: ExtendedError[]
  isValidationVisible?: boolean
}

export function useValidationResult(payload?: IPayload) {
  const {
    scope = 'base',
  } = payload ?? {}

  const {
    isValidationVisibleByScope,
    validationParts,
    errorsStructure,
    validate: validateStore,
  } = useValidationStore()

  // State
  const isValidationVisible = computed(() => {
    const isVisibleScope = isValidationVisibleByScope.value[scope]

    return isVisibleScope
  })

  function validate() {
    validateStore(scope)

    return {
      isValid: !errorsStructure.value.byScope[scope]?.length,
      errors: errorsStructure.value.byScope[scope],
    }
  }

  function reset() {
    isValidationVisibleByScope.value[scope] = false
  }

  function getMeta(
    path?: string,
    options?: {
      includeChildren?: boolean

      /**
       * When true, the errors will be returned for the current component only
       *
       * @default true
       */
      local?: boolean
    },
  ): IArkResult {
    const { includeChildren = false, local = true } = options ?? {}
    let errors: ExtendedError[] = []

    let validPaths: string[] = [path as string].filter(Boolean)

    if (path && includeChildren) {
      validPaths = Object.keys((errorsStructure.value.byScopeByPath[scope] ?? []))
        .filter(p => p.startsWith(path))
    }

    if (local && path) {
      const lastValidationPartWithSchemaInScope = validationParts.value.findLast(part => part.scope === scope && part.schema)

      if (lastValidationPartWithSchemaInScope) {
        errors = validPaths.flatMap(path => errorsStructure.value.byScopeByPath[scope]?.[path] ?? [])
          .filter(error => error.$componentName === lastValidationPartWithSchemaInScope.componentName)
      }
    } else if (path) {
      errors = validPaths.flatMap(path => errorsStructure.value.byScopeByPath[scope]?.[path] ?? [])
    } else {
      errors = errorsStructure.value.byScope[scope] ?? []
    }

    // Get schema from errors first, fallback to the schema passed to useArk,
    // or try to find it in validationPartsByScope
    const resolvedSchema = errors[0]?.$schema
      ?? validationParts.value.find(part => part.scope === scope && part.schema)?.schema
    console.log('Log ~ getMeta ~ resolvedSchema:', resolvedSchema)

    const isRequired = resolvedSchema && path
      ? isFieldRequired({ path: String(path), schema: resolvedSchema })
      : false

    const messages = errors.map(error => error.$message)
    const message = messages.join(' • ')

    return {
      path,
      isRequired,
      message,
      messages,
      errors,
      isValidationVisible: isValidationVisible.value,
    }
  }

  const validation = {
    validate: () => {
      validateStore(scope)

      const errors = errorsStructure.value.byScope[scope] ?? []
      const messages = errors.map(error => error.$message)

      return { isValid: !errors.length, errors: messages }
    },
    reset: () => {
      isValidationVisibleByScope.value[scope] = false
    },
    getMeta,
  }

  return {
    errorsStructure,
    validation,
    validate,
    reset,
  }
}

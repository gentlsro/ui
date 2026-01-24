import type { Type } from 'arktype'

// Store
import { useValidationStore } from '../stores/validation.store'
import type { ExtendedArkError } from '../stores/validation.store'

type MaybeRefsOrGetters<T> = {
  [K in keyof T]: MaybeRefOrGetter<T[K]>
}

type IPayload<Validation extends Type> = {
  state?: MaybeRefOrGetter<Validation['infer']> | MaybeRefsOrGetters<Validation['infer']>
  schema?: Validation
  scope?: string
  immediate?: boolean
}

export type IArkResult = {
  path?: string
  isRequired: boolean
  message: string
  messages: string[]
  errors: ExtendedArkError[]
  isValidationVisible?: boolean
}

function isFieldRequired<T extends Type>(payload: {
  path: string
  schema: T
}) {
  const { path, schema } = payload
  const internal = schema.internal

  // For object types, check if path is in optionalKeys
  if ('structure' in internal && internal.structure) {
    const structure = internal.structure as { optionalKeys?: string[] }

    return !structure.optionalKeys?.includes(path)
  }

  return true
}

export function useArk<Validation extends Type = any>(payload?: IPayload<Validation>) {
  const {
    state,
    schema,
    scope = 'base',
    immediate = false,
  } = payload ?? {}

  const self = getCurrentInstance()
  const componentName = `${getComponentName(self)}_${generateUUID()}`

  const validationStore = useValidationStore()
  const {
    isValidationVisibleByScope,
    validationPartsByScope,
    errorsStructure,
  } = storeToRefs(validationStore)

  // Init - handle `immediate`
  if (immediate) {
    isValidationVisibleByScope.value[scope] = true
  }

  // Init - add the schema to the scope
  if (state && schema) {
    // Make sure scope exists
    if (!validationPartsByScope.value[scope]) {
      validationPartsByScope.value[scope] = []
    }

    // Add validation part
    validationPartsByScope.value[scope] = [
      ...validationPartsByScope.value[scope],
      {
        state,
        schema,
        componentName,
      },
    ]
  }

  // State
  function validate() {
    isValidationVisibleByScope.value[scope] = true

    return {
      isValid: !errorsStructure.value.byScope[scope]?.length,
      errors: errorsStructure.value.byScope[scope],
    }
  }

  function reset() {
    isValidationVisibleByScope.value[scope] = false
  }

  function getMeta(
    path?: ObjectKey<Validation['infer']>,
    options?: {
      includeChildren?: boolean
    },
  ): IArkResult {
    const { includeChildren = false } = options ?? {}

    let errors = path
      ? (errorsStructure.value.byScopeByPath[scope]?.[path] ?? [])
      : (errorsStructure.value.byScope[scope] ?? [])

    if (includeChildren && path) {
      const validPaths = Object.keys((errorsStructure.value.byScopeByPath[scope] ?? []))
        .filter(p => p.startsWith(path))

      errors = validPaths.flatMap(path => errorsStructure.value.byScopeByPath[scope]?.[path] ?? [])
    }

    // Get schema from errors first, fallback to the schema passed to useArk,
    // or try to find it in validationPartsByScope
    const resolvedSchema = errors[0]?.$schema
      ?? schema
      ?? validationPartsByScope.value[scope]?.[0]?.schema

    const isRequired = resolvedSchema && path
      ? isFieldRequired({ path: String(path), schema: resolvedSchema })
      : false

    const messages = errors.map(arkError => arkError.$message)
    const message = messages.join(' • ')

    return {
      path,
      isRequired,
      message,
      messages,
      errors,
      isValidationVisible: isValidationVisibleByScope.value[scope],
    }
  }

  const validation = {
    validate: () => {
      isValidationVisibleByScope.value[scope] = true
      const errors = errorsStructure.value.byScope[scope] ?? []
      const messages = errors.map(arkError => arkError.$message)

      return { isValid: !errors.length, errors: messages }
    },
    reset: () => {
      isValidationVisibleByScope.value[scope] = false
    },
    getMeta,
  }

  // Lifecycle
  tryOnUnmounted(() => {
    validationPartsByScope.value[scope] = validationPartsByScope.value[scope]
      ?.filter(part => part.componentName !== componentName) ?? []

    if (isValidationVisibleByScope.value[scope]) {
      validate()
    }
  })

  return {
    errorsStructure,
    validation,
    validate,
    reset,
  }
}

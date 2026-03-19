import type { z } from 'zod'

// Store
import { useValidationStore } from '../stores/validation.store'
import type { ExtendedError } from '../stores/validation.store'

// Utils
import { isFieldRequired } from '../functions/is-field-required'

type MaybeRefsOrGetters<T> = {
  [K in keyof T]: MaybeRefOrGetter<T[K]>
}

type IPayload<Validation extends z.ZodType> = {
  state?: MaybeRefOrGetter<z.infer<Validation>> | MaybeRefsOrGetters<z.infer<Validation>>
  schema?: Validation
  scope?: string
  immediate?: boolean
}

export type IZodNewResult = {
  path?: string
  isRequired: boolean
  message: string
  messages: string[]
  errors: ExtendedError[]
  isValidationVisible?: boolean
}

export function useZod<Validation extends z.ZodType = z.ZodType>(payload?: IPayload<Validation>) {
  const {
    state,
    schema,
    scope = 'base',
    immediate = false,
  } = payload ?? {}

  const self = getCurrentInstance()
  const componentName = `${getComponentName(self)}_${generateUUID()}`

  const {
    isValidationVisibleByScope,
    isValidationVisibleByComponentName,
    validationParts,
    errorsStructure,
    validate: validateStore,
    reset: resetStore,
  } = useValidationStore()

  // Add validation part
  validationParts.value = [
    ...validationParts.value,
    {
      state,
      schema,
      componentName,
      scope,
    },
  ]

  // Init - handle `immediate`
  if (immediate) {
    validateStore(scope)
  }

  // State
  const isValidationVisible = computed(() => {
    const isVisibleScope = isValidationVisibleByScope.value[scope]
    const isVisibleComponent = isValidationVisibleByComponentName.value[componentName]

    return isVisibleScope && isVisibleComponent
  })

  function validate() {
    validateStore(scope)

    return {
      isValid: !errorsStructure.value.byScope[scope]?.length,
      errors: errorsStructure.value.byScope[scope],
    }
  }

  function reset() {
    resetStore(scope)
  }

  function getMeta(
    path?: ObjectKey<z.infer<Validation>>,
    options?: {
      includeChildren?: boolean
      includeAncestors?: boolean
      /**
       * When true, the errors will be returned for the current component only
       *
       * @default true
       */
      local?: boolean
    },
  ): IZodNewResult {
    const { includeChildren = false, includeAncestors = true, local = true } = options ?? {}
    let errors: ExtendedError[] = []

    let validPaths: string[] = [path as string].filter(Boolean)

    if (path && includeChildren) {
      validPaths = Object.keys((errorsStructure.value.byScopeByPath[scope] ?? []))
        .filter(p => p.startsWith(path))
    }

    if (path && includeAncestors) {
      const pathParts = path.split('.')
      const parentPath = pathParts.slice(0, -1)

      validPaths.unshift(...parentPath)
    }

    if (local && path) {
      if (schema) {
        errors = validPaths.flatMap(path => errorsStructure.value.byScopeByPath[scope]?.[path] ?? [])
          .filter(error => error.$componentName === componentName)
      } else {
        const lastValidationPartWithSchemaInScope = validationParts.value.findLast(part => part.scope === scope && part.schema)

        if (lastValidationPartWithSchemaInScope) {
          errors = validPaths.flatMap(path => errorsStructure.value.byScopeByPath[scope]?.[path] ?? [])
            .filter(error => error.$componentName === lastValidationPartWithSchemaInScope.componentName)
        }
      }
    } else if (path) {
      errors = validPaths.flatMap(path => errorsStructure.value.byScopeByPath[scope]?.[path] ?? [])
    } else {
      errors = errorsStructure.value.byScope[scope] ?? []
    }

    // Get schema from errors first, fallback to the schema passed to useZod,
    // or try to find it in validationPartsByScope
    const resolvedSchema = errors[0]?.$schema
      ?? schema
      ?? validationParts.value.find(part => part.scope === scope && part.schema)?.schema

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
    reset,
    getMeta,
  }

  // Lifecycle
  tryOnUnmounted(() => {
    validationParts.value = validationParts.value
      ?.filter(part => part.componentName !== componentName) ?? []
  })

  return {
    errorsStructure,
    validation,
    validate,
    reset,
  }
}

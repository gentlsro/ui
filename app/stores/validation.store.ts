import { type } from 'arktype'
import { z } from 'zod'

// Utils
import { translateZodIssue } from '#layers/utilities/app/functions/translate-zod-issue'
import type { SchemaType } from '../functions/is-field-required'
import { isZodSchema } from '../functions/is-field-required'

/**
 * Get translated message from a Zod issue
 */
function getZodIssueMessage(issue: z.ZodIssue): string {
  // Cast needed due to Zod internal type differences between ZodIssue and $ZodIssue
  const result = (translateZodIssue as (issue: unknown) => string | { message: string } | null | undefined)(issue)

  if (!result) {
    return issue.message
  }

  if (typeof result === 'string') {
    return result
  }

  return result.message ?? issue.message
}

export type ExtendedError = {
  error: unknown

  $path: string
  $schema: SchemaType
  $message: string
  $componentName?: string
}

type IValidationPart = {
  scope?: string
  state?: MaybeRefOrGetter<any>
  schema?: SchemaType
  componentName?: string
}

type IPayload = {
  injectionKey?: string
}

export const VALIDATION_INJECTION_KEY: InjectionKey<string> = Symbol('__validation')

function resolveErrorsRecursively(payload: {
  result: unknown
  errors?: ExtendedError[]
  schema: SchemaType
  componentName?: string
}) {
  const { result, errors, schema, componentName } = payload

  // ArkType
  if (result instanceof type.errors) {
    const resultFlat = result.flat().flatMap(err => err.flat)

    resultFlat.forEach(result => {
      const $message = translateArkError(result, $t)

      errors?.push({
        $path: result.path.join('.'),
        $message,
        $schema: schema,
        $componentName: componentName,
        error: result,
      })
    })
  }

  // Zod - result is a SafeParseReturnType
  if (
    result
    && typeof result === 'object'
    && 'success' in result
    && result.success === false
    && 'error' in result
    && result.error instanceof z.ZodError
  ) {
    result.error.issues.forEach(issue => {
      errors?.push({
        $path: issue.path.join('.'),
        $message: getZodIssueMessage(issue),
        $schema: schema,
        $componentName: componentName,
        error: issue,
      })
    })
  }
}

function createStore(injectionKey?: string) {
  const injectionState = createInjectionState((_payload?: IPayload) => {
    const validationParts = ref<IValidationPart[]>([])

    const isValidationVisibleByScope = ref<Record<string, boolean>>({})
    const isValidationVisibleByComponentName = ref<Record<string, boolean>>({})

    const errorsByScope = computed(() => {
      return validationParts.value
        .reduce((agg, { scope = 'base', componentName, schema, state }) => {
          if (agg[scope] === undefined) {
            agg[scope]! = []
          }

          if (schema && state) {
            // Handle both ArkType and Zod schemas
            const result = isZodSchema(schema)
              ? schema.safeParse(toValue(state))
              : schema(toValue(state))

            resolveErrorsRecursively({
              result,
              schema,
              errors: agg[scope],
              componentName,
            })
          }

          return agg
        }, {} as Record<string, ExtendedError[]>)
    })

    const errorsStructure = computed(() => {
      const byScope = errorsByScope.value

      const byScopeByComponentName = Object.entries(errorsByScope.value)
        .reduce((agg, [scope, errors]) => {
          if (agg[scope] === undefined) {
            agg[scope]! = {}
          }

          const errorsByComponentName = errors
            .reduce((agg, error) => {
              const componentName = error.$componentName ?? '__unknown__'

              if (agg[componentName] === undefined) {
                agg[componentName] = []
              }

              agg[componentName]?.push(error)

              return agg
            }, {} as Record<string, ExtendedError[]>)

          agg[scope] = merge(agg[scope], errorsByComponentName)

          return agg
        }, {} as Record<string, Record<string, ExtendedError[]>>)

      const byScopeByPath = Object.entries(errorsByScope.value)
        .reduce((agg, [scope, errors]) => {
          if (agg[scope] === undefined) {
            agg[scope]! = {}
          }

          const errorsByPath = errors
            .reduce((agg, error) => {
              const path = error.$path

              if (agg[path] === undefined) {
                agg[path] = []
              }

              agg[path]?.push(error)

              return agg
            }, {} as Record<string, ExtendedError[]>)

          agg[scope] = merge(agg[scope], errorsByPath)

          return agg
        }, {} as Record<string, Record<string, ExtendedError[]>>)

      return {
        byScope,
        byScopeByPath,
        byScopeByComponentName,
      }
    })

    function validate(scope: string) {
      isValidationVisibleByScope.value[scope] = true

      validationParts.value.forEach(({ scope: partScope, componentName }) => {
        if (scope === partScope && componentName) {
          isValidationVisibleByComponentName.value[componentName] = true
        }
      })
    }

    return {
      errorsByScope,
      validationParts,
      isValidationVisibleByScope,
      isValidationVisibleByComponentName,
      errorsStructure,
      validate,
    }
  }, { injectionKey })

  return injectionState
}

export function useValidationStore(payload?: IPayload) {
  let injectionKey = payload?.injectionKey ?? injectLocal(VALIDATION_INJECTION_KEY)

  if (!injectionKey) {
    const uuid = generateUUID()
    provideLocal(VALIDATION_INJECTION_KEY, uuid)
    injectionKey = uuid
  }

  const [useProvideValidationStore, useConsumeValidationStore] = createStore(injectionKey)!

  return useConsumeValidationStore() ?? useProvideValidationStore(payload)
}

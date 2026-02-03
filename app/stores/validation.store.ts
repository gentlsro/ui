import { type } from 'arktype'
import type { ArkError, ArkErrors, Type } from 'arktype'

export type ExtendedArkError = ArkError & {
  $schema: Type
  $message: string
  $componentName?: string
}

type IValidationPart = {
  state?: MaybeRefOrGetter<any>
  schema?: Type
  componentName?: string
}

type IPayload = {
  injectionKey?: string
}

export const VALIDATION_INJECTION_KEY: InjectionKey<string> = Symbol('__validation')

function resolveErrorsRecursively(payload: {
  result: unknown
  errors?: ExtendedArkError[]
  schema: Type
  componentName?: string
}) {
  const { result, errors, schema, componentName } = payload

  if (result instanceof type.errors) {
    const resultFlat = result.flat().flatMap(err => err.flat)

    resultFlat.forEach(result => {
      const $message = translateArkError(result, $t)
      const extendedError = Object.assign(
        {},
        result,
        { $message, $schema: schema, $componentName: componentName },
      )

      errors?.push(extendedError)
    })
  }
}

function createStore(injectionKey?: string) {
  const injectionState = createInjectionState((_payload?: IPayload) => {
    const validationPartsByScope = ref<Record<string, IValidationPart[]>>({
      base: [],
    })

    const isValidationVisibleByScope = ref<Record<string, boolean>>({})
    const isValidationVisibleByComponentName = ref<Record<string, boolean>>({})

    const errorsByScope = computed(() => {
      return Object.entries(validationPartsByScope.value)
        .reduce((agg, [scope, validationParts]) => {
          if (agg[scope] === undefined) {
            agg[scope]! = []
          }

          validationParts.forEach(validationPart => {
            if (validationPart.schema && validationPart.state) {
              const result = validationPart.schema(toValue(validationPart.state))

              resolveErrorsRecursively({
                result,
                schema: validationPart.schema,
                errors: agg[scope],
                componentName: validationPart.componentName,
              })
            }
          })

          return agg
        }, {} as Record<string, ExtendedArkError[]>)
    })

    const errorsStructure = computed(() => {
      const byScope = errorsByScope.value

      const byScopeByComponentName = Object.entries(errorsByScope.value)
        .reduce((agg, [scope, errors]) => {
          if (agg[scope] === undefined) {
            agg[scope]! = {}
          }

          const arkErrorsByComponentName = errors
            .reduce((agg, arkError) => {
              const componentName = arkError.$componentName ?? '__unknown__'

              if (agg[componentName] === undefined) {
                agg[componentName] = []
              }

              agg[componentName]?.push(arkError)

              return agg
            }, {} as Record<string, ExtendedArkError[]>)

          agg[scope] = merge(agg[scope], arkErrorsByComponentName)

          return agg
        }, {} as Record<string, Record<string, ExtendedArkError[]>>)

      const byScopeByPath = Object.entries(errorsByScope.value)
        .reduce((agg, [scope, errors]) => {
          if (agg[scope] === undefined) {
            agg[scope]! = {}
          }

          const arkErrorsByPath = errors
            .reduce((agg, arkError) => {
              const path = arkError.path.join('.')

              if (agg[path] === undefined) {
                agg[path] = []
              }

              agg[path]?.push(arkError)

              return agg
            }, {} as Record<string, ExtendedArkError[]>)

          agg[scope] = merge(agg[scope], arkErrorsByPath)

          return agg
        }, {} as Record<string, Record<string, ExtendedArkError[]>>)

      const byScopeByComponentNameByPath = Object.entries(errorsByScope.value)
        .reduce((agg, [scope, errors]) => {
          if (agg[scope] === undefined) {
            agg[scope]! = {}
          }

          const arkErrorsByComponentNameByPath = errors
            .reduce((innerAgg, arkError) => {
              const componentName = arkError.$componentName ?? '__unknown__'
              const path = arkError.path.join('.')

              if (innerAgg[componentName] === undefined) {
                innerAgg[componentName] = {}
              }

              if (innerAgg[componentName]![path] === undefined) {
                innerAgg[componentName]![path] = []
              }

              innerAgg[componentName]![path]?.push(arkError)

              return innerAgg
            }, {} as Record<string, Record<string, ExtendedArkError[]>>)

          agg[scope] = merge(agg[scope], arkErrorsByComponentNameByPath)

          return agg
        }, {} as Record<string, Record<string, Record<string, ExtendedArkError[]>>>)

      return {
        byScope,
        byScopeByPath,
        byScopeByComponentName,
        byScopeByComponentNameByPath,
      }
    })

    function validate(scope: string) {
      const parts = validationPartsByScope.value[scope]

      parts?.forEach(part => {
        if (part.componentName) {
          isValidationVisibleByComponentName.value[part.componentName] = true
        }
      })

      isValidationVisibleByScope.value[scope] = true
    }

    return {
      errorsByScope,
      validationPartsByScope,
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

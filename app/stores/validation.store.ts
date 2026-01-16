import { type } from 'arktype'
import type { ArkError, ArkErrors, Type } from 'arktype'

export type ExtendedArkError = ArkError & {
  $schema: Type
  $message: string
}

type IValidationPart = {
  state?: MaybeRefOrGetter<any>
  schema?: Type
  componentName?: string
}

function resolveErrorsRecursively(payload: {
  result: unknown
  errors?: ExtendedArkError[]
  schema: Type
}) {
  const { result, errors, schema } = payload

  if (result instanceof type.errors) {
    const resultFlat = result.flat().flatMap(err => err.flat)

    resultFlat.forEach(result => {
      const $message = translateArkError(result, $t)
      const extendedError = Object.assign(
        {},
        result,
        { $message, $schema: schema },
      )

      errors?.push(extendedError)
    })
  }
}

export const useValidationStore = defineStore('__validation', () => {
  const validationPartsByScope = ref<Record<string, IValidationPart[]>>({
    base: [],
  })

  const isValidationVisibleByScope = ref<Record<string, boolean>>({})

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
            })
          }
        })

        return agg
      }, {} as Record<string, ExtendedArkError[]>)
  })

  const errorsStructure = computed(() => {
    const byScope = errorsByScope.value

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

    return {
      byScope,
      byScopeByPath,
    }
  })

  return {
    errorsByScope,
    validationPartsByScope,
    isValidationVisibleByScope,
    errorsStructure,
  }
})

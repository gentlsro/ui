import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { computed, ref, shallowRef, toValue, unref } from 'vue'
import { type } from 'arktype'
import type { Type } from 'arktype'
import { describe, expect, it } from 'vitest'
import ts from 'typescript'
import type { useArk } from './useArk'
import { isFieldRequired } from '../functions/is-field-required'

const filename = new URL('./useArk.ts', import.meta.url)
const require = createRequire(filename)

function createFixture() {
  const parts = ref<Array<{ schema?: Type, state?: unknown, componentName?: string }>>([])
  const cleanup: Array<() => void> = []
  const errorsStructure = computed(() => {
    const errors = parts.value.flatMap(part => {
      const state = toValue(part.state as () => unknown)

      return part.schema && !part.schema.allows(state)
        ? [{ $schema: part.schema, $componentName: part.componentName, $path: 'value', $message: 'Invalid' }]
        : []
    })

    return { byScope: { form: errors }, byScopeByPath: { form: { value: errors } } }
  })
  const store = {
    validationParts: parts,
    errorsStructure,
    isValidationVisibleByScope: ref({ form: false }),
    isValidationVisibleByComponentName: ref({}),
    validate: () => {},
    reset: () => {},
  }
  const exports: { useArk?: typeof useArk } = {}
  const { outputText } = ts.transpileModule(readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  })

  // Supply Nuxt context while exercising the checked-in composable and real schemas.
  // eslint-disable-next-line no-new-func
  new Function('require', 'exports', 'computed', 'unref', 'getCurrentInstance', 'getComponentName', 'generateUUID', 'tryOnUnmounted', outputText)(
    (name: string) => {
      if (name === '../stores/validation.store') {
        return { useValidationStore: () => store }
      }
      if (name === '../functions/is-field-required') {
        return { isFieldRequired }
      }

      return require(name)
    },
    exports,
    computed,
    unref,
    () => ({}),
    () => 'Fixture',
    () => 'fixture',
    (callback: () => void) => cleanup.push(callback),
  )

  return { useArk: exports.useArk!, parts, cleanup }
}

describe('reactive ArkType schema registration', () => {
  it('updates validation and required metadata without registering another form part', () => {
    const { useArk, parts, cleanup } = createFixture()
    const schema = shallowRef<Type<any>>(type('never'))
    const model = ref({ value: 'ready' })
    const { validation } = useArk({ schema, state: model, scope: 'form' })

    expect(validation.validate().isValid).toBe(false)
    schema.value = type({ value: 'string' })
    expect(validation.validate().isValid).toBe(true)
    expect(validation.getMeta('value').isRequired).toBe(true)

    schema.value = type({ 'value?': 'string > 5' })
    expect(validation.validate().isValid).toBe(false)
    expect(validation.getMeta('value').isRequired).toBe(false)
    expect(validation.getMeta('value').errors[0]?.$schema).toBe(schema.value)
    expect(parts.value).toHaveLength(1)
    cleanup.forEach(stop => stop())
    expect(parts.value).toEqual([])
  })

  it('keeps accepting an ordinary schema without a ref', () => {
    const { useArk } = createFixture()
    const { validation } = useArk({
      schema: type({ value: 'string' }),
      state: () => ({ value: 'plain schema' }),
      scope: 'form',
    })

    expect(validation.validate().isValid).toBe(true)
    expect(validation.getMeta('value').isRequired).toBe(true)
  })
})

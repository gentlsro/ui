import { describe, expect, it } from 'vitest'
import { createSSRApp, defineComponent, h, ref } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { z } from 'zod'

import { useZod } from './useZod'

async function validateWith(name: string) {
  let result: ReturnType<ReturnType<typeof useZod>['validate']> | undefined

  // (a component's setup without a DOM or a Nuxt app: rendered once to a string)
  await renderToString(createSSRApp(defineComponent({
    setup() {
      const { validate } = useZod({
        state: ref({ name }),
        schema: z.object({ name: z.string().min(3) }),
      })

      result = validate()

      return () => h('div')
    },
  })))

  return result
}

// zod >= 4.5 reads its internals through `this`, which throws when the schema
// was turned into a reactive proxy by the validation store
describe('useZod', () => {
  it('validates a schema kept in the validation store', async () => {
    await expect(validateWith('John')).resolves.toMatchObject({ isValid: true })
  })

  it('reports the issues of an invalid state', async () => {
    const result = await validateWith('Jo')

    expect(result?.isValid).toBe(false)
    expect(result?.errors?.map(error => error.$path)).toEqual(['name'])
  })
})

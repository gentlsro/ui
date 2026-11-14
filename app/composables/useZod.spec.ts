import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { defineComponent, h, ref } from 'vue'
import { z } from 'zod'

import { useZod } from './useZod'

async function validateWith(name: string) {
  let result: ReturnType<ReturnType<typeof useZod>['validate']> | undefined

  await mountSuspended(defineComponent({
    setup() {
      const { validate } = useZod({
        state: ref({ name }),
        schema: z.object({ name: z.string().min(3) }),
      })

      result = validate()

      return () => h('div')
    },
  }))

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

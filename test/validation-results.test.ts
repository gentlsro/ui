import { type } from 'arktype'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import { isFieldRequired, isZodSchema } from '../app/functions/is-field-required'
import { flattenArkErrors, isArkErrors, isZodFailure } from '../app/functions/validation-results'

describe('validation results by shape', () => {
  it('recognises ArkType errors and flattens union branches', () => {
    const schema = type({ name: 'string', age: 'number | string.numeric' })
    const result = schema({ name: 1, age: false })

    expect(isArkErrors(result)).toBe(true)
    expect(isArkErrors(schema({ name: 'ok', age: 1 }))).toBe(false)
    expect(isArkErrors([{ path: [], message: 'looks like data' }])).toBe(false)
    const leaves = flattenArkErrors(result as any)
    expect(leaves.map(error => error.path.join('.'))).toContain('name')
    expect(leaves.every(error => typeof error.message === 'string')).toBe(true)
  })

  it('recognises Zod failures and nothing else', () => {
    const schema = z.object({ name: z.string() })

    expect(isZodFailure(schema.safeParse({ name: 1 }))).toBe(true)
    expect(isZodFailure(schema.safeParse({ name: 'ok' }))).toBe(false)
    expect(isZodFailure({ success: false, error: new Error('plain') })).toBe(false)
  })

  it('reads required fields from Zod schemas through their public kind', () => {
    const schema = z.object({
      name: z.string(),
      nick: z.string().optional(),
      tags: z.array(z.object({ label: z.string(), note: z.string().nullable().default(null) })),
    })

    expect(isZodSchema(schema)).toBe(true)
    expect(isFieldRequired({ path: 'name', schema })).toBe(true)
    expect(isFieldRequired({ path: 'nick', schema })).toBe(false)
    expect(isFieldRequired({ path: 'tags.0.label', schema })).toBe(true)
    expect(isFieldRequired({ path: 'tags.0.note', schema })).toBe(false)
  })

  it('reads required fields from ArkType schemas', () => {
    const schema = type({ 'name': 'string', 'nick?': 'string' })

    expect(isZodSchema(schema)).toBe(false)
    expect(isFieldRequired({ path: 'name', schema })).toBe(true)
    expect(isFieldRequired({ path: 'nick', schema })).toBe(false)
  })
})

import { describe, expect, it } from 'vitest'
import fc from 'fast-check'
import { resolveRuntimeIconName } from './resolve-runtime-icon-name'

describe('runtime icon provider names', () => {
  it('resolves aliases and the longest collection prefix without mutating app config', () => {
    const options = { collections: ['demo', 'demo-long'], aliases: { brand: 'demo-long:mark' } }
    const before = structuredClone(options)
    expect(resolveRuntimeIconName('i-demo-long-mark', options)).toBe('demo-long:mark')
    expect(resolveRuntimeIconName('brand', options)).toBe('demo-long:mark')
    expect(resolveRuntimeIconName('i-brand', options)).toBe('demo-long:mark')
    expect(options).toEqual(before)
  })

  it('keeps CSS variants, classes and malformed provider paths out of requests', () => {
    for (const name of ['hover:i-demo:mark', 'custom-icon', 'demo:../mark', 'demo:mark?url=other', ' demo:mark', 'demo:mark other']) {
      expect(resolveRuntimeIconName(name, {})).toBeUndefined()
    }
    expect(resolveRuntimeIconName('i-custom-mark', { customCollections: ['custom'] })).toBe('custom:mark')
    expect(resolveRuntimeIconName('custom:brand_mark', {})).toBe('custom:brand_mark')
  })

  it('round-trips canonical/legacy values from generated collection and icon names', () => {
    const name = fc.stringMatching(/^[a-z][a-z0-9-]{1,18}$/)
    fc.assert(fc.property(name, name, (collection, id) => {
      const options = { collections: [collection] }
      const expected = `${collection}:${id}`
      expect(resolveRuntimeIconName(expected, options)).toBe(expected)
      expect(resolveRuntimeIconName(`i-${expected}`, options)).toBe(expected)
      expect(resolveRuntimeIconName(`i-${collection}-${id}`, options)).toBe(expected)
    }), { examples: [['i-0', 'a0']] })
  })
})

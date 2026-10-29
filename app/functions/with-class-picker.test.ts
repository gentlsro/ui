import { describe, expect, expectTypeOf, it } from 'vitest'
import { withClassPicker } from './with-class-picker'

// Failure modes: reordered or omitted picks, changed defaults, shared picker state,
// and accepting nested maps or the picker itself as a class name.
describe('withClassPicker', () => {
  it('joins requested classes in caller order, including repeated picks', () => {
    const defaults = withClassPicker({ base: 'flex', focus: 'outline', all: 'flex outline' } as const)

    expect(defaults.p('focus', 'base', 'focus')).toBe('outline flex outline')
    expect(defaults.p('all')).toBe('flex outline')
    expect(defaults.p()).toBe('')
    expect(defaults.base).toBe('flex')
    expect(defaults.all).toBe('flex outline')
    expectTypeOf(defaults.base).toEqualTypeOf<'flex'>()
  })

  it('preserves empty variants and nested maps without making maps pickable', () => {
    const sizes = { sm: 'h-8', lg: 'h-12' } as const
    const defaults = withClassPicker({ base: 'flex', disabled: '', sizes, all: 'flex h-8' })

    expect(defaults.sizes).toBe(sizes)
    expect(defaults.p('base', 'disabled')).toBe('flex ')
    expectTypeOf<Parameters<typeof defaults.p>[number]>().toEqualTypeOf<'base' | 'disabled' | 'all'>()
  })

  it('keeps detached pickers tied to their own invocation', () => {
    const { p } = withClassPicker({ base: 'first' })
    const other = withClassPicker({ base: 'second' })

    expect(other.p('base')).toBe('second')
    expect(p('base')).toBe('first')
  })
})

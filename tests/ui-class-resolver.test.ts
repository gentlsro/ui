import { describe, expect, it } from 'vitest'
import { createUIClassResolver } from '../app/utils/create-ui-class-resolver'

// Failure modes: reading config during module initialization, repeated layer work,
// stale derived classes, loss of an explicit override, and cross-instance leaks.
describe('shared UI class resolver', () => {
  const spec = {
    slots: {
      toggleClass(props: { size: 'sm' | 'lg' }) {
        return {
          base: 'base',
          sizes: { sm: 'small', lg: 'large' },
          size: props.size === 'sm' ? 'small' : 'large',
        }
      },
    },
    compose: { toggleClass: (slots: { base: string, size: string }) => `${slots.base} ${slots.size}` },
    defaults: { toggleClass: () => ({ base: 'base', all: 'default', p: () => 'base' }) },
    derive: { toggleClass: { size: (slots: { sizes: Record<string, string> }, props: { size: string }) => slots.sizes[props.size] } },
  }

  it('reads layers once, on first use, and keeps direct default factories', () => {
    let reads = 0
    const resolved = createUIClassResolver('toggle', spec, () => {
      reads++

      return []
    })
    expect(reads).toBe(0)
    expect(resolved.toggleClass).toBe(spec.defaults.toggleClass)
    expect(resolved.toggleClass).toBe(spec.defaults.toggleClass)
    expect(reads).toBe(1)
  })

  it('derives named slots from preceding and final nested overrides', () => {
    const resolved = createUIClassResolver('toggle', spec, () => [
      { uiClasses: { classDefaults: { toggle: { toggleClass: { sizes: { sm: 'theme-small' } } } } } },
      { uiClasses: { classDefaults: { toggle: { toggleClass: ({ defaults }: { defaults: { size: string } }) => ({ base: defaults.size }) } } } },
    ])
    const small = resolved.toggleClass({ size: 'sm', contained: false })
    const large = resolved.toggleClass({ size: 'lg', contained: false })
    expect(small.p('size')).toBe('theme-small')
    expect(small.all).toBe('theme-small theme-small')
    expect(large.all).toBe('large large')
    expect(small.all).toBe('theme-small theme-small')
  })

  it('lets explicit named slots replace a derived value', () => {
    const resolved = createUIClassResolver('toggle', spec, () => [
      { uiClasses: { classDefaults: { toggle: { toggleClass: { size: 'explicit' } } } } },
      { uiClasses: { classDefaults: { toggle: { toggleClass: { sizes: { sm: 'theme-small' } } } } } },
    ])
    const value = resolved.toggleClass({ size: 'sm', contained: false })
    expect(value.p('size')).toBe('explicit')
    expect(value.all).toBe('base explicit')
  })
})

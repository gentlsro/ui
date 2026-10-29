import { describe, expect, it } from 'vitest'
import { createButtonClassResolver } from '../app/utils/create-button-class-resolver'
import type { ButtonStyleProps } from '../app/components/Button/types/button-style-props.type'
import { BTN_DEFAULT_PROPS } from '../app/components/Button/constants/btn-default-props.constant'

const resolveLayers = (layers: unknown[]) => createButtonClassResolver(layers.map(uiClasses => ({ uiClasses })))

// Failure modes: lost layer order/keys, stale all/p after slot overrides,
// lost nested variants, stale reactive props, instance leaks, and default-path overhead.
describe('button class layers', () => {
  it('uses the existing factories directly when there are no class overrides', () => {
    const resolved = resolveLayers([{}, { button: { props: { size: 'sm' } } }])
    expect(resolved.containerClass).toBe(BTN_DEFAULT_PROPS.ui.containerClass)
    expect(resolved.iconClass).toBe(BTN_DEFAULT_PROPS.ui.iconClass)
  })

  it('merges named and nested slots in layer order and recomposes all and p', () => {
    const resolved = resolveLayers([
      { classDefaults: { button: { containerClass: { base: 'theme', brand: 'brand', sizes: { sm: 'theme-sm' } } } } },
      { classDefaults: { button: { containerClass: ({ defaults }: { defaults: { base: string } }) => ({ base: `${defaults.base}-app`, app: 'app' }) } } },
    ])
    const defaults = resolved.containerClass({ size: 'sm', hasLabel: true })
    expect(defaults.base).toBe('theme-app')
    expect(defaults.all).toContain('theme-app')
    expect(defaults.all).toContain('theme-sm')
    expect(defaults.sizes.lg).toContain('min-h-12')
    expect(defaults.p('base')).toBe('theme-app')
    expect(defaults).toMatchObject({ brand: 'brand', app: 'app' })
  })

  it('runs an inherited composer on final slots and current instance props', () => {
    const resolved = resolveLayers([
      { classComposition: { button: { containerClass: (slots: { base: string, sizes: Record<string, string> }, props: ButtonStyleProps) => `${slots.base} ${slots.sizes[props.size ?? 'md']}` } } },
      { classDefaults: { button: { containerClass: { base: 'application', sizes: { sm: 'compact', lg: 'large' } } } } },
    ])
    const small = resolved.containerClass({ size: 'sm', hasLabel: true })
    const large = resolved.containerClass({ size: 'lg', hasLabel: true })
    expect(small.all).toBe('application compact')
    expect(large.all).toBe('application large')
    expect(small.all).toBe('application compact')
    expect(resolved.iconClass).toBe(BTN_DEFAULT_PROPS.ui.iconClass)
  })

  it('keeps dynamic patches per evaluation and uses the last composer', () => {
    const resolved = resolveLayers([
      { classComposition: { button: { iconClass: () => 'old' } } },
      {
        classDefaults: { button: { iconClass: ({ props }: { props: { size: 'sm' | 'lg' } }) => ({ base: props.size }) } },
        classComposition: { button: { iconClass: (slots: { base: string }) => slots.base } },
      },
    ])
    expect(resolved.iconClass({ size: 'sm' }).all).toBe('sm')
    expect(resolved.iconClass({ size: 'lg' }).p('base')).toBe('lg')
  })
})

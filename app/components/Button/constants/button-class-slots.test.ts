import { describe, expect, it, vi } from 'vitest'
import { BTN_CLASS_COMPOSERS, BTN_CLASS_SLOTS } from './btn-default-props.constant'

vi.mock('$uiConfig', () => ({ uiClassLayers: [] }))

// Failure modes: all captures old slot values; nested size overrides are ignored;
// conditional slots are lost or incorrectly included after merging.
describe('button class composition', () => {
  it('composes overridden base and nested size slots', () => {
    const props = { hasLabel: true, size: 'sm' } as const
    const original = BTN_CLASS_SLOTS.containerClass(props)
    const slots = {
      ...original,
      base: 'replacement-base',
      sizes: { ...original.sizes, sm: 'replacement-size' },
    }
    const all = BTN_CLASS_COMPOSERS.containerClass(slots, props)

    expect(all).toContain('replacement-base')
    expect(all).toContain('replacement-size')
    expect(all).not.toContain(original.base)
    expect(all).not.toContain(original.sizes.sm)
  })

  it('applies conditional overrides only when their state is active', () => {
    const props = { hasLabel: false, disabled: true, round: true, rounded: true, disableStyle: 'flat' } as const
    const slots = {
      ...BTN_CLASS_SLOTS.containerClass(props),
      disabled: 'replacement-disabled',
      disabledFlat: 'replacement-flat',
      interactive: 'replacement-interactive',
      round: 'replacement-round',
      rounded: 'replacement-rounded',
      noLabel: 'replacement-no-label',
    }
    const all = BTN_CLASS_COMPOSERS.containerClass(slots, props)

    expect(all).toContain('replacement-disabled')
    expect(all).toContain('replacement-flat')
    expect(all).toContain('replacement-round')
    expect(all).toContain('replacement-no-label')
    expect(all).not.toContain('replacement-interactive')
    expect(all).not.toContain('replacement-rounded')
  })

  it('uses overridden alignment and size values for the label', () => {
    const props = { size: 'lg', align: 'right' } as const
    const original = BTN_CLASS_SLOTS.labelClass(props)
    const slots = {
      ...original,
      base: 'label-base',
      alignLeft: 'label-left',
      alignRight: 'label-right',
      sizes: { ...original.sizes, lg: 'label-size' },
    }

    expect(BTN_CLASS_COMPOSERS.labelClass(slots, props)).toBe('label-base label-size label-right')
  })

  it('uses merged slots for every remaining button surface', () => {
    const props = { size: 'sm' } as const
    const icon = BTN_CLASS_SLOTS.iconClass(props)
    const loader = BTN_CLASS_SLOTS.loaderClass(props)

    expect(BTN_CLASS_COMPOSERS.iconClass({ ...icon, base: 'icon', sizes: { ...icon.sizes, sm: 'icon-size' } }, props)).toBe('icon icon-size')
    expect(BTN_CLASS_COMPOSERS.loaderClass({ ...loader, base: 'loader', sizes: { ...loader.sizes, sm: 'loader-size' } }, props)).toBe('loader loader-size')
    expect(BTN_CLASS_COMPOSERS.focusHelperClass({ base: 'focus', hover: 'hover' })).toBe('focus hover')
    expect(BTN_CLASS_COMPOSERS.loadingClass({ base: 'loading' })).toBe('loading')
  })
})

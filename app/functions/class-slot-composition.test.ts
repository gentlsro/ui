import { describe, expect, it, vi } from 'vitest'
import { BANNER_CLASS_COMPOSERS, BANNER_CLASS_SLOTS } from '../components/Banner/constants/banner-default-props.constant'
import { BADGE_CLASS_DERIVED, BADGE_CLASS_SLOTS } from '../components/Badge/constants/badge-default-props.constant'
import { CHECKBOX_CLASS_COMPOSERS, CHECKBOX_CLASS_SLOTS } from '../components/Checkbox/constants/checkbox-default-props.constant'
import { DATE_PICKER_CLASS_COMPOSERS, DATE_PICKER_CLASS_SLOTS } from '../components/DatePicker/constants/datepicker-default-props.constant'
import { STEPPER_CLASS_COMPOSERS, STEPPER_CLASS_SLOTS } from '../components/Stepper/constants/stepper-default-props.constant'
import { TOGGLE_CLASS_COMPOSERS, TOGGLE_CLASS_DERIVED, TOGGLE_CLASS_SLOTS } from '../components/Toggle/constants/toggle-default-props.constant'

vi.mock('$uiConfig', () => ({ uiClassLayers: [] }))

// Failure modes: captured original slots, stale selected map values, derived
// slots ignoring patches, and state branches losing their selection rules.
describe('uI class composition', () => {
  it('selects overridden Banner variants after patching', () => {
    const props = { variant: 'info', outlined: true } as const
    const original = BANNER_CLASS_SLOTS.containerClass(props)
    const slots = { ...original, base: 'brand-base', variants: { ...original.variants, infoOutlined: 'brand-outlined' } }
    const all = BANNER_CLASS_COMPOSERS.containerClass(slots, props)

    expect(all).toContain('brand-base')
    expect(all).toContain('brand-outlined')
    expect(all).not.toContain(original.variants.infoOutlined)
  })

  it('uses patched Checkbox size and color maps', () => {
    const props = { size: 'sm', color: 'primary' } as const
    const original = CHECKBOX_CLASS_SLOTS.checkboxClass(props)
    const slots = { ...original, sizes: { ...original.sizes, sm: 'small-size' }, colors: { ...original.colors, primary: 'brand-color' } }
    const all = CHECKBOX_CLASS_COMPOSERS.checkboxClass(slots, props)

    expect(all).toContain('small-size')
    expect(all).toContain('brand-color')
  })

  it('recalculates Badge composite slots from patched constituent slots', () => {
    const original = BADGE_CLASS_SLOTS.containerClass()
    const slots = { ...original, base: 'brand-base' }

    expect(Object.getOwnPropertyDescriptor(original, 'noPosition')?.get).toBeUndefined()
    expect(BADGE_CLASS_DERIVED.containerClass.noPosition(slots)).toContain('brand-base')
    expect(BADGE_CLASS_DERIVED.containerClass.noPosition(slots)).not.toContain(original.base)
  })

  it('recalculates Toggle size aliases without allocating getter slots', () => {
    const props = { size: 'sm', contained: true } as const
    const original = TOGGLE_CLASS_SLOTS.toggleClass(props)
    const patched = { ...original, sizes: { ...original.sizes, smContained: 'brand-size' } }
    const slots = { ...patched, size: TOGGLE_CLASS_DERIVED.toggleClass.size(patched, props) }

    expect(Object.getOwnPropertyDescriptor(original, 'size')?.get).toBeUndefined()
    expect(slots.size).toBe('brand-size')
    expect(TOGGLE_CLASS_COMPOSERS.toggleClass(slots, props)).toContain('brand-size')
    expect(TOGGLE_CLASS_COMPOSERS.toggleClass({ ...slots, size: 'explicit-size' }, props)).toContain('explicit-size')
  })

  it('composes the requested Stepper layout from patched map entries', () => {
    const props = { layout: 'horizontalBottom', size: 'sm' } as const
    const original = STEPPER_CLASS_SLOTS.containerClass(props)
    const slots = { ...original, layouts: { ...original.layouts, horizontalBottom: 'bottom-layout' } }

    expect(STEPPER_CLASS_COMPOSERS.containerClass(slots, props)).toContain('bottom-layout')
  })

  it('keeps DatePicker state selection when replacing slot values', () => {
    const props = { isSelected: true } as Parameters<typeof DATE_PICKER_CLASS_SLOTS.dayEdgeClass>[0]
    const original = DATE_PICKER_CLASS_SLOTS.dayEdgeClass(props)
    const slots = { ...original, color: 'idle', selected: 'selected' }

    expect(DATE_PICKER_CLASS_COMPOSERS.dayEdgeClass(slots, props)).toContain('selected')
    expect(DATE_PICKER_CLASS_COMPOSERS.dayEdgeClass(slots, { ...props, isSelected: false })).toContain('idle')
  })
})

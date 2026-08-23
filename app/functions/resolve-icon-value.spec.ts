import { describe, expect, it } from 'vitest'
import { resolveIconValue } from './resolve-icon-value'

describe('resolveIconValue', () => {
  it('keeps canonical Iconify names separate from styling classes', () => {
    expect(resolveIconValue('lucide:home !w-4 rotate-90')).toEqual({
      classes: '!w-4 rotate-90',
      name: 'lucide:home',
    })
  })

  it('normalizes legacy colon names and finds them after custom classes', () => {
    expect(resolveIconValue('step-icon i-bi:caret-up-fill rotate-180')).toEqual({
      classes: 'step-icon rotate-180',
      name: 'bi:caret-up-fill',
    })
  })

  it('leaves legacy dash names for Nuxt Icon to resolve by collection', () => {
    expect(resolveIconValue('i-solar-copy-line-duotone !h-4')).toEqual({
      classes: '!h-4',
      name: 'i-solar-copy-line-duotone',
    })
  })

  it('supports Vue class arrays and conditional class maps', () => {
    expect(
      resolveIconValue(['i-lucide:home', { 'color-positive': true, 'opacity-0': false }]),
    ).toEqual({
      classes: 'color-positive',
      name: 'lucide:home',
    })
  })

  it('preserves class-only fallbacks', () => {
    expect(resolveIconValue(['custom-icon', 'custom-icon--active'])).toEqual({
      classes: 'custom-icon custom-icon--active',
    })
  })

  it('preserves the previous single-token custom icon behavior', () => {
    expect(resolveIconValue('CustomIconComponent')).toEqual({
      classes: '',
      name: 'CustomIconComponent',
    })
  })
})

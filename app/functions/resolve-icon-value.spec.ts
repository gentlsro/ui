import { describe, expect, it } from 'vitest'
import { resolveIconValue } from './resolve-icon-value'

describe('resolveIconValue', () => {
  it('keeps canonical Iconify names separate from styling classes', () => {
    expect(resolveIconValue('lucide:home !w-4 rotate-90')).toEqual({
      classes: '!w-4 rotate-90',
      name: 'lucide:home',
    })
  })

  it('preserves mixed legacy icon classes, including custom Uno collections', () => {
    expect(resolveIconValue('step-icon i-bi:caret-up-fill rotate-180')).toEqual({
      classes: 'step-icon i-bi:caret-up-fill rotate-180',
      name: 'i-bi:caret-up-fill',
    })
  })

  it('preserves mixed legacy dash classes', () => {
    expect(resolveIconValue('i-solar-copy-line-duotone !h-4')).toEqual({
      classes: 'i-solar-copy-line-duotone !h-4',
      name: 'i-solar-copy-line-duotone',
    })
  })

  it('prioritizes a legacy icon over custom Uno variants in the class list', () => {
    expect(resolveIconValue('wrapper:w-4 i-lucide:home group-[open]/wrapper:h-4')).toEqual({
      classes: 'wrapper:w-4 i-lucide:home group-[open]/wrapper:h-4',
      name: 'i-lucide:home',
    })
  })

  it('supports Vue class arrays and conditional class maps', () => {
    expect(
      resolveIconValue(['i-lucide:home', { 'color-positive': true, 'opacity-0': false }]),
    ).toEqual({
      classes: 'i-lucide:home color-positive',
      name: 'i-lucide:home',
    })
  })

  it('preserves class-only fallbacks', () => {
    expect(resolveIconValue(['custom-icon', 'custom-icon--active'])).toEqual({
      classes: 'custom-icon custom-icon--active',
    })
  })

  it('keeps CSS variants in class-only values and beside a canonical icon', () => {
    expect(resolveIconValue(['custom-icon', 'hover:opacity-80', 'md:rotate-90'])).toEqual({
      classes: 'custom-icon hover:opacity-80 md:rotate-90',
    })
    expect(resolveIconValue('hover:opacity-80 lucide:home')).toEqual({
      classes: 'hover:opacity-80',
      name: 'lucide:home',
    })
    expect(resolveIconValue('hover:opacity-80')).toEqual({ classes: 'hover:opacity-80' })
  })

  it('handles empty and nested conditional class values', () => {
    expect(resolveIconValue()).toEqual({ classes: '' })
    expect(resolveIconValue([false, undefined, { 'i-lucide:home': false }])).toEqual({ classes: '' })
    expect(resolveIconValue([['custom-size'], { 'i-lucide:home': true }])).toEqual({
      classes: 'custom-size i-lucide:home',
      name: 'i-lucide:home',
    })
  })

  it('retains whitespace-wrapped class fallbacks', () => {
    expect(resolveIconValue(' custom-icon ')).toEqual({ classes: 'custom-icon' })
    expect(resolveIconValue('  i-lucide:home  rotate-90 ')).toEqual({
      classes: 'i-lucide:home rotate-90',
      name: 'i-lucide:home',
    })
  })

  it('extracts direct and preset-style legacy names while preserving styling', () => {
    expect(resolveIconValue('i-lucide:home')).toEqual({ classes: '', name: 'i-lucide:home' })
    expect(resolveIconValue(['i-custom:brand'])).toEqual({ classes: 'i-custom:brand', name: 'i-custom:brand' })
    expect(resolveIconValue('i-custom:brand custom-size')).toEqual({ classes: 'i-custom:brand custom-size', name: 'i-custom:brand' })
    expect(resolveIconValue(['lucide:home', { 'rotate-90': true }])).toEqual({
      classes: 'rotate-90',
      name: 'lucide:home',
    })
  })

  it('preserves the previous single-token custom icon behavior', () => {
    expect(resolveIconValue('CustomIconComponent')).toEqual({
      classes: '',
      name: 'CustomIconComponent',
    })
  })
})

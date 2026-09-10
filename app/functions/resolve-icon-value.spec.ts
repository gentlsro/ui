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
    })
  })

  it('preserves mixed legacy dash classes', () => {
    expect(resolveIconValue('i-solar-copy-line-duotone !h-4')).toEqual({
      classes: 'i-solar-copy-line-duotone !h-4',
    })
  })

  it('supports Vue class arrays and conditional class maps', () => {
    expect(
      resolveIconValue(['i-lucide:home', { 'color-positive': true, 'opacity-0': false }]),
    ).toEqual({
      classes: 'i-lucide:home color-positive',
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
    })
  })

  it('retains whitespace-wrapped class fallbacks', () => {
    expect(resolveIconValue(' custom-icon ')).toEqual({ classes: 'custom-icon' })
    expect(resolveIconValue('  i-lucide:home  rotate-90 ')).toEqual({
      classes: 'i-lucide:home  rotate-90',
    })
  })

  it('keeps a direct legacy name while treating preset-style arrays as classes', () => {
    expect(resolveIconValue('i-lucide:home')).toEqual({ classes: '', name: 'i-lucide:home' })
    expect(resolveIconValue(['i-custom:brand'])).toEqual({ classes: 'i-custom:brand' })
    expect(resolveIconValue('i-custom:brand custom-size')).toEqual({ classes: 'i-custom:brand custom-size' })
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

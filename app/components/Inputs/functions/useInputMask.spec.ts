// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { effectScope, nextTick, shallowRef } from 'vue'
import { MaskedNumber } from 'imask'
import type { FactoryOpts } from 'imask'
import { useInputMask } from './useInputMask'

const disposers: Array<() => void> = []
afterEach(() => disposers.splice(0).forEach(dispose => dispose()))

function fixture(initialValue: unknown, config: FactoryOpts) {
  const scope = effectScope()
  const maskOptions = shallowRef(config)
  const onAccept = vi.fn()
  const onComplete = vi.fn()
  const binding = scope.run(() => useInputMask(maskOptions, {
    initialValue,
    isEmptyValue: value => value === null || value === undefined,
    onAccept,
    onComplete,
  }))!
  disposers.push(() => scope.stop())

  return { binding, maskOptions, onAccept, onComplete, scope }
}

describe('input mask DOM ownership', () => {
  it('retains pre-mount writes, repeated zero and edits through ref replacement', async () => {
    const { binding, maskOptions } = fixture(null, { mask: Number, radix: ',', scale: 2, padFractionalZeros: true })
    binding.typed.value = 0
    binding.clear()
    binding.typed.value = 0
    expect(binding.masked.value).toBe('0,00')
    const first = document.createElement('input')
    binding.el.value = first
    await nextTick()
    expect(first.value).toBe('0,00')
    binding.typed.value = 12.5
    binding.el.value = undefined
    await nextTick()
    maskOptions.value = { mask: Number, radix: '.', scale: 2, padFractionalZeros: true }
    await nextTick()
    const second = document.createElement('textarea')
    binding.el.value = second
    await nextTick()
    expect(second.value).toBe('12.50')
    expect(binding.typed.value).toBe(12.5)
  })

  it('publishes formatted refs before callbacks and distinguishes incomplete patterns', async () => {
    const { binding, onAccept, onComplete } = fixture('', { mask: '00:00', lazy: false })
    binding.el.value = document.createElement('input')
    await nextTick()
    expect(binding.masked.value).toBe('__:__')
    const accepted: string[] = []
    onAccept.mockImplementation(() => accepted.push(binding.masked.value))
    binding.unmasked.value = '12'
    expect(accepted).toEqual(['12:__'])
    expect(onComplete).not.toHaveBeenCalled()
    binding.masked.value = '12:34'
    expect(accepted).toEqual(['12:__', '12:34'])
    expect(binding.unmasked.value).toBe('1234')
    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('does not mutate shared mask instances and destroys listeners with its scope', async () => {
    const source = new MaskedNumber({ mask: Number, radix: '.' })
    source.typedValue = 99
    const first = fixture(12.5, source)
    const second = fixture(25, source)
    const input = document.createElement('input')
    first.binding.el.value = input
    second.binding.el.value = document.createElement('input')
    await nextTick()
    first.binding.typed.value = 30
    expect(second.binding.typed.value).toBe(25)
    expect(source.typedValue).toBe(99)
    first.onAccept.mockClear()
    first.scope.stop()
    input.value = '77'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    expect(first.binding.mask.value).toBeUndefined()
    expect(first.onAccept).not.toHaveBeenCalled()
    expect(first.binding.typed.value).toBe(30)
  })
})

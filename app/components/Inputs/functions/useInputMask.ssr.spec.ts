// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { createSSRApp, h, shallowRef } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { MaskedNumber } from 'imask'
import { useInputMask } from './useInputMask'

describe('input mask server rendering', () => {
  it('formats independently of browser globals and leaves caller-owned masks untouched', async () => {
    expect(typeof window).toBe('undefined')
    expect(typeof document).toBe('undefined')
    const source = new MaskedNumber({ mask: Number, radix: ',', scale: 2, padFractionalZeros: true })
    source.typedValue = 99

    async function render(value: number | null) {
      return renderToString(createSSRApp({
        setup() {
          const { masked } = useInputMask(shallowRef(source), {
            initialValue: value,
            isEmptyValue: value => value == null,
          })
          return () => h('input', { value: masked.value })
        },
      }))
    }

    expect(await render(null)).toMatch(/^<input value(?:="")?>$/)
    expect(await render(0)).toBe('<input value="0,00">')
    expect(await render(12.5)).toBe('<input value="12,50">')
    expect(source.typedValue).toBe(99)
  })
})

// @vitest-environment happy-dom
import { afterAll, afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { computed, createSSRApp, defineComponent, getCurrentInstance, h, nextTick, onMounted, provide, reactive, ref, shallowRef, toRefs, toValue, unref, useId, watch } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { unrefElement, useDebounceFn, useVModel } from '@vueuse/core'
import { isEqual, isNil } from 'lodash-es'
import { MaskedNumber } from 'imask'
import type { FactoryOpts } from 'imask'
import { useInputUtils } from './useInputUtils'
import { useUIStore } from '../../../stores/ui.store'

// Supply Nuxt's autoimports with the real framework functions for this isolated mask lifecycle check.
for (const [name, value] of Object.entries({
  computed,
  getCurrentInstance,
  isEqual,
  isNil,
  nextTick,
  onMounted,
  provide,
  ref,
  toRefs,
  toValue,
  unref,
  unrefElement,
  useDebounceFn,
  useId,
  useUIStore,
  useVModel,
  watch,
})) {
  vi.stubGlobal(name, value)
}

afterAll(() => vi.unstubAllGlobals())

vi.mock('./useInputWrapperUtils', () => ({
  useInputWrapperUtils: () => ({ getInputWrapperProps: () => ({}) }),
}))

vi.mock('../../../stores/ui.store', () => ({ useUIStore: () => ({}) }))

const disposers: Array<() => void> = []

afterEach(() => {
  disposers.splice(0).forEach(dispose => dispose())
  vi.restoreAllMocks()
  vi.useRealTimers()
})

async function settle() {
  for (let i = 0; i < 5; i++) {
    await nextTick()
  }
}

function inputFixture(initialValue: any = null, maskOptions: FactoryOpts = { mask: Number, radix: '.' }, extraProps = {}) {
  const props = reactive({ modelValue: initialValue, emptyValue: null, id: 'test-input', ...extraProps })
  const maskRef = shallowRef(maskOptions)
  const visible = ref(true)
  let input: ReturnType<typeof useInputUtils>
  const emitted = vi.fn()
  const component = defineComponent({
    emits: ['update:modelValue', 'blur', 'clear'],
    setup() {
      input = useInputUtils({ props, maskRef })

      return () => visible.value ? h('input', { ref: input.el, value: input.masked.value }) : null
    },
  })

  return {
    props,
    maskRef,
    component,
    emitted,
    visible,
    get input() {
      return input!
    },
  }
}

function inputHarness(...args: Parameters<typeof inputFixture>) {
  const fixture = inputFixture(...args)
  const wrapper = mount(fixture.component, { attrs: { 'onUpdate:modelValue': fixture.emitted } })
  disposers.push(() => wrapper.unmount())

  return { ...fixture, wrapper }
}

describe('input mask synchronization', () => {
  it('uses the typed formatter when an empty numeric field is set to zero', async () => {
    const mask = new MaskedNumber({
      mask: Number,
      radix: '.',
      scale: 2,
      normalizeZeros: false,
      format: value => value == null ? '' : value.toFixed(2),
    })
    const { props, wrapper } = inputHarness(null, mask)
    await settle()
    expect(wrapper.element.value).toBe('')

    props.modelValue = 0
    await settle()
    expect(wrapper.element.value).toBe('0.00')
  })

  it('displays zero after clearing and emits local changes once', async () => {
    const { props, input, wrapper, emitted } = inputHarness()
    await settle()
    expect(emitted).not.toHaveBeenCalled()

    input.model.value = 0
    await settle()
    expect(wrapper.element.value).toBe('0')
    expect(input.hasNoValue.value).toBe(false)
    expect(emitted.mock.calls).toEqual([[0]])

    props.modelValue = 0
    await settle()
    input.setTypedValue(0)
    await settle()
    expect(emitted).toHaveBeenCalledTimes(1)

    input.clear()
    await settle()
    expect(wrapper.element.value).toBe('')
    expect(input.hasNoValue.value).toBe(true)
    props.modelValue = null
    await settle()
    props.modelValue = 0
    await settle()
    expect(wrapper.element.value).toBe('0')
  })

  it.each([null, undefined, ''])('clears a populated number using emptyValue %s', async emptyValue => {
    const { input, wrapper } = inputHarness(12, undefined, { emptyValue })
    await settle()
    input.setTypedValue(emptyValue)
    await settle()
    expect(wrapper.element.value).toBe('')
    expect(input.model.value).toBe(emptyValue)
    input.setTypedValue(0)
    await settle()
    expect(wrapper.element.value).toBe('0')
  })

  it('formats currency values and reflects typed input in the model', async () => {
    const { props, input, wrapper, emitted } = inputHarness(null, {
      mask: Number,
      radix: ',',
      thousandsSeparator: ' ',
      scale: 2,
      padFractionalZeros: true,
    })
    await settle()
    props.modelValue = -1234.5
    await settle()
    expect(wrapper.element.value).toBe('-1 234,50')
    expect(emitted).not.toHaveBeenCalled()

    await wrapper.get('input').setValue('42,75')
    await settle()
    expect(input.model.value).toBe(42.75)
    expect(emitted.mock.calls).toEqual([[42.75]])
  })

  it('keeps an incomplete pattern visible without emitting until complete', async () => {
    const { input, wrapper, emitted } = inputHarness(null, { mask: '00:00', lazy: false })
    await settle()
    await wrapper.get('input').setValue('12:')
    await settle()
    expect(wrapper.element.value).toBe('12:__')
    expect(emitted).not.toHaveBeenCalled()
    expect(input.lastValidValue.value).toBe(null)

    await wrapper.get('input').setValue('12:34')
    await settle()
    expect(emitted.mock.calls).toEqual([['1234']])
  })

  it('defers model emissions until blur when requested', async () => {
    const { input, wrapper, emitted } = inputHarness(null, undefined, { emitOnBlur: true })
    await settle()
    await wrapper.get('input').setValue('0')
    await settle()
    expect(input.model.value).toBe(0)
    expect(emitted).not.toHaveBeenCalled()
    input.handleBlur(new FocusEvent('blur'))
    await settle()
    expect(emitted.mock.calls).toEqual([[0]])
  })

  it('debounces accepted values without delaying the display', async () => {
    vi.useFakeTimers()
    const { wrapper, emitted } = inputHarness(null, undefined, { debounce: 50 })
    await settle()
    await wrapper.get('input').setValue('1')
    await settle()
    await wrapper.get('input').setValue('12')
    await settle()
    expect(wrapper.element.value).toBe('12')
    expect(emitted).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(50)
    expect(emitted.mock.calls).toEqual([[12]])
  })

  it('isolates mask instances shared by multiple inputs', async () => {
    const source = new MaskedNumber({ mask: Number, radix: '.' })
    source.typedValue = 99
    const first = inputHarness(12, source)
    const second = inputHarness(34, source)
    await settle()
    first.input.setTypedValue(56)
    await settle()
    expect(first.wrapper.element.value).toBe('56')
    expect(second.wrapper.element.value).toBe('34')
    expect(source.typedValue).toBe(99)
  })

  it('updates formatting when mask options change', async () => {
    const { maskRef, wrapper } = inputHarness(1234.5, { mask: Number, radix: '.', thousandsSeparator: ',' })
    await settle()
    maskRef.value = { mask: Number, radix: ',', thousandsSeparator: ' ', padFractionalZeros: true, scale: 2 }
    await settle()
    expect(wrapper.element.value).toBe('1 234,50')
  })

  it('preserves values across element replacement and detaches old listeners', async () => {
    const { visible, input, maskRef, wrapper, emitted } = inputHarness(12)
    await settle()
    input.setTypedValue(34)
    await settle()
    const oldElement = wrapper.get('input').element
    visible.value = false
    await settle()

    oldElement.value = '99'
    oldElement.dispatchEvent(new InputEvent('input', { bubbles: true }))
    await settle()
    expect(input.model.value).toBe(34)

    maskRef.value = { mask: Number, radix: ',', scale: 2, padFractionalZeros: true }
    await settle()
    visible.value = true
    await settle()
    expect(wrapper.get('input').element.value).toBe('34,00')
    expect(emitted.mock.calls).toEqual([[34]])
  })

  it('accepts writes before the input element exists', async () => {
    const { visible, input, wrapper } = inputHarness()
    await settle()
    visible.value = false
    await settle()
    input.setTypedValue(0)
    await settle()
    visible.value = true
    await settle()
    expect(wrapper.get('input').element.value).toBe('0')
  })

  it('supports writable callback refs without dropping repeated zero writes', async () => {
    const { input, wrapper } = inputHarness()
    await settle()
    input.typed.value = 0
    await settle()
    expect(wrapper.get('input').element.value).toBe('0')
    input.unmasked.value = ''
    await settle()
    input.typed.value = 0
    await settle()
    expect(wrapper.get('input').element.value).toBe('0')
  })

  it('retains the cursor when an accepted value is echoed by the parent', async () => {
    const { wrapper, props } = inputHarness('1234', { mask: /^\d*$/ })
    await settle()
    const element = wrapper.get('input').element
    element.setSelectionRange(2, 2)
    await wrapper.get('input').trigger('keydown', { key: '5', keyCode: 53 })
    element.value = '12534'
    element.setSelectionRange(3, 3)
    element.dispatchEvent(new InputEvent('input', { data: '5', inputType: 'insertText', bubbles: true }))
    await settle()
    props.modelValue = '12534'
    await settle()
    expect(element.value).toBe('12534')
    expect(element.selectionStart).toBe(3)
  })

  it.each([
    { value: null, mask: { mask: Number }, display: '' },
    { value: 0, mask: { mask: Number }, display: '0' },
    { value: 1234.5, mask: { mask: Number, radix: ',', thousandsSeparator: ' ', padFractionalZeros: true, scale: 2 }, display: '1 234,50' },
    { value: null, mask: { mask: '00:00', lazy: false }, display: '__:__' },
    { value: '1234', mask: { mask: '00:00', lazy: false }, display: '12:34' },
  ])('renders and hydrates $display without changing the value', async ({ value, mask, display }) => {
    const server = inputFixture(value, mask)
    const html = await renderToString(createSSRApp(server.component))
    const container = document.createElement('div')
    container.innerHTML = html
    expect(container.querySelector('input')?.value).toBe(display)

    const warnings = vi.spyOn(console, 'warn')
    const errors = vi.spyOn(console, 'error')
    const client = inputFixture(value, mask)
    const app = createSSRApp(client.component, { 'onUpdate:modelValue': client.emitted })
    app.mount(container)
    disposers.push(() => app.unmount())
    await settle()
    expect(container.querySelector('input')?.value).toBe(display)
    expect(client.emitted).not.toHaveBeenCalled()
    expect(warnings).not.toHaveBeenCalled()
    expect(errors).not.toHaveBeenCalled()
  })
})

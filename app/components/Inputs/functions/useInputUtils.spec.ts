// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { computed, createSSRApp, defineComponent, h, nextTick, reactive, ref, shallowRef } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { MaskedNumber } from 'imask'
import type { FactoryOpts } from 'imask'
import { useInputUtils } from './useInputUtils'
import NumberInput from '../NumberInput/NumberInput.vue'
import CurrencyInput from '../CurrencyInput/CurrencyInput.vue'
import DateInput from '../DateInput/DateInput.vue'
import DatePicker from '../../DatePicker/DatePicker.vue'

vi.mock('../../../../../Utilities/app/utils/$t', () => ({ $t: (key: string) => key }))

const testLocale = reactive({ code: 'cs-CZ' })

vi.mock('./useInputWrapperUtils', () => ({
  useInputWrapperUtils: () => ({ getInputWrapperProps: () => ({}) }),
}))

vi.mock('../../../stores/ui.store', () => ({ useUIStore: () => ({}) }))
vi.mock('./useInputValidationUtils', () => ({ useInputValidationUtils: () => ({ path: '' }) }))
vi.mock('../../../../../Utilities/app/composables/useNumber', () => ({
  useNumber: () => ({
    separators: shallowRef({ thousandSeparator: ' ', decimalSeparator: ',' }),
    parseNumber: (value: string) => Number(value.replace(',', '.')),
  }),
}))
vi.mock('../../../../../Utilities/app/composables/useLocale', () => ({
  useLocale: () => ({
    currentLocale: computed(() => ({ code: testLocale.code })),
    getCurrentLocaleDateFormat: () => testLocale.code === 'cs-CZ' ? 'DD.MM.YYYY' : 'MM/DD/YYYY',
    getLocaleDateFormat: () => testLocale.code === 'cs-CZ' ? 'DD.MM.YYYY' : 'MM/DD/YYYY',
  }),
}))

const disposers: Array<() => void> = []

afterEach(() => {
  disposers.splice(0).forEach(dispose => dispose())
  vi.restoreAllMocks()
  vi.useRealTimers()
  testLocale.code = 'cs-CZ'
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

describe('numeric input components', () => {
  const stubs = {
    InputWrapper: defineComponent({
      setup(_, { slots }) {
        return () => h('div', slots.default?.({}))
      },
    }),
  }

  it('updates NumberInput from an external model and from paste', async () => {
    const wrapper = mount(NumberInput, { props: { modelValue: null, emptyValue: null }, global: { stubs } })
    disposers.push(() => wrapper.unmount())
    await settle()
    const input = wrapper.get('input')
    expect(input.element.value).toBe('')
    await wrapper.setProps({ modelValue: 0 })
    await settle()
    expect(input.element.value).toBe('0')
    await wrapper.setProps({ modelValue: null })
    await settle()
    await input.trigger('paste', { clipboardData: { getData: () => '0' } })
    await settle()
    expect(input.element.value).toBe('0')
    expect(wrapper.emitted('update:modelValue')).toEqual([[0]])
  })

  it('formats CurrencyInput zero for external updates and beforeinput', async () => {
    const wrapper = mount(CurrencyInput, { props: { modelValue: null, emptyValue: null, noCurrency: true }, global: { stubs } })
    disposers.push(() => wrapper.unmount())
    await settle()
    const input = wrapper.get('input')
    await wrapper.setProps({ modelValue: 0 })
    await settle()
    expect(input.element.value).toBe('0,00')
    await wrapper.setProps({ modelValue: null })
    await settle()

    input.element.dispatchEvent(new InputEvent('beforeinput', { data: '0', inputType: 'insertText', bubbles: true, cancelable: true }))
    await settle()
    expect(input.element.value).toBe('0,00')
    expect(wrapper.emitted('update:modelValue')).toEqual([[0]])

    await wrapper.setProps({ modelValue: 0 })
    await settle()
    input.element.setSelectionRange(0, input.element.value.length)
    input.element.dispatchEvent(new InputEvent('beforeinput', { inputType: 'deleteContentBackward', bubbles: true, cancelable: true }))
    await settle()
    expect(input.element.value).toBe('')
    expect(wrapper.emitted('update:modelValue')).toEqual([[0], [null]])
  })
})

describe('date input editing', () => {
  it.each(['2026-05-20', null])('restores the last valid date %s when changing locale during editing', async value => {
    const wrapper = mount(DateInput, {
      props: { modelValue: value, format: 'YYYY-MM-DD' },
      global: { stubs: { InputWrapper: defineComponent({
        setup(_, { slots }) {
          return () => h('div', slots.default?.({}))
        },
      }) } },
    })
    disposers.push(() => wrapper.unmount())
    await settle()
    const input = wrapper.get('input')
    await input.setValue('21')
    await settle()
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    testLocale.code = 'en-US'
    await settle()
    expect(input.element.value).toBe(value ? '05/20/2026' : 'MM/DD/YYYY')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    await input.setValue('06/22/2026')
    await settle()
    expect(wrapper.emitted('update:modelValue')).toEqual([['2026-06-22']])
  })

  it('keeps the Dayjs model unchanged and uses the new locale for subsequent model updates', async () => {
    const { $date } = await import('../../../../../Utilities/shared/utils/$date')
    const value = $date('2026-12-09', { utc: false })
    const wrapper = mount(DateInput, {
      props: { modelValue: value },
      global: { stubs: { InputWrapper: defineComponent({
        setup(_, { slots }) {
          return () => h('div', slots.default?.({}))
        },
      }) } },
    })
    disposers.push(() => wrapper.unmount())
    await settle()
    expect(wrapper.emitted('update:modelValue'), 'no emission on initial mount').toBeUndefined()
    testLocale.code = 'en-US'
    await settle()
    expect(wrapper.get('input').element.value).toBe('12/09/2026')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    await wrapper.setProps({ modelValue: $date('2026-05-20', { utc: false }) })
    await settle()
    expect(wrapper.get('input').element.value).toBe('05/20/2026')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it.each(['2026-12-09', '2026-05-20', null])('preserves %s across locale changes without emitting', async value => {
    const wrapper = mount(DateInput, {
      props: { modelValue: value, format: 'YYYY-MM-DD' },
      global: { stubs: { InputWrapper: defineComponent({
        setup(_, { slots }) {
          return () => h('div', slots.default?.({}))
        },
      }) } },
    })
    disposers.push(() => wrapper.unmount())
    await settle()
    const input = wrapper.get('input')
    const before = input.element.value
    testLocale.code = 'en-US'
    await settle()
    expect(input.element.value).toBe(value === null ? 'MM/DD/YYYY' : value === '2026-12-09' ? '12/09/2026' : '05/20/2026')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    testLocale.code = 'cs-CZ'
    await settle()
    expect(input.element.value).toBe(before)
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it.each(['typing', 'paste'])('pads a single-digit month during compact date entry by %s', async method => {
    const wrapper = mount(DateInput, {
      props: { modelValue: null, format: 'YYYY-MM-DD' },
      global: {
        stubs: {
          InputWrapper: defineComponent({
            setup(_, { slots }) {
              return () => h('div', slots.default?.({}))
            },
          }),
        },
      },
    })
    disposers.push(() => wrapper.unmount())
    await settle()
    const input = wrapper.get('input')

    if (method === 'paste') {
      await input.setValue('2062026')
    } else {
      for (const digit of '2062026') {
        const index = input.element.value.search(/[DMY]/)
        input.element.setSelectionRange(index, index)
        await input.trigger('keydown', { key: digit, keyCode: digit.charCodeAt(0) })
        const value = input.element.value
        input.element.value = value.slice(0, index) + digit + value.slice(index)
        input.element.setSelectionRange(index + 1, index + 1)
        input.element.dispatchEvent(new InputEvent('input', { data: digit, inputType: 'insertText', bubbles: true }))
        await settle()
      }
    }

    await settle()
    expect(input.element.value).toBe('20.06.2026')
    expect(wrapper.emitted('update:modelValue')).toEqual([['2026-06-20']])
  })

  it.each([
    { locale: 'cs-CZ', key: 'Delete', index: 4, before: '20.05.2026', partial: '20.0M.2026', digit: '6', after: '20.06.2026', date: '2026-06-20' },
    { locale: 'cs-CZ', key: 'Backspace', index: 4, before: '20.05.2026', partial: '20.0M.2026', digit: '6', after: '20.06.2026', date: '2026-06-20' },
    { locale: 'cs-CZ', key: 'Delete', index: 3, before: '20.05.2026', partial: '20.M5.2026', digit: '0', after: '20.05.2026', date: '2026-05-20' },
    { locale: 'cs-CZ', key: 'Delete', index: 6, before: '20.05.2026', partial: '20.05.Y026', digit: '2', after: '20.05.2026', date: '2026-05-20' },
    { locale: 'cs-CZ', key: 'Delete', index: 1, before: '20.05.2026', partial: '2D.05.2026', digit: '1', after: '21.05.2026', date: '2026-05-21' },
    { locale: 'en-US', key: 'Delete', index: 1, before: '05/20/2026', partial: '0M/20/2026', digit: '6', after: '06/20/2026', date: '2026-06-20' },
    { locale: 'en-US', key: 'Backspace', index: 6, before: '05/20/2026', partial: '05/20/Y026', digit: '2', after: '05/20/2026', date: '2026-05-20' },
  ])('preserves other date parts after $key at $index in $locale', async ({ locale, key, index, before, partial, digit, after, date }) => {
    testLocale.code = locale
    const wrapper = mount(DateInput, {
      props: { modelValue: '2026-05-20', format: 'YYYY-MM-DD' },
      global: {
        stubs: {
          InputWrapper: defineComponent({
            setup(_, { slots }) {
              return () => h('div', slots.default?.({}))
            },
          }),
        },
      },
    })
    disposers.push(() => wrapper.unmount())
    await settle()
    const input = wrapper.get('input')
    expect(input.element.value).toBe(before)
    const cursor = key === 'Backspace' ? index + 1 : index
    input.element.setSelectionRange(cursor, cursor)
    await input.trigger('keydown', { key, keyCode: key === 'Backspace' ? 8 : 46 })
    input.element.value = before.slice(0, index) + before.slice(index + 1)
    input.element.setSelectionRange(index, index)
    input.element.dispatchEvent(new InputEvent('input', {
      inputType: key === 'Backspace' ? 'deleteContentBackward' : 'deleteContentForward',
      bubbles: true,
    }))
    await settle()
    expect(input.element.value).toBe(partial)
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()

    input.element.setSelectionRange(index, index)
    await input.trigger('keydown', { key: digit, keyCode: digit.charCodeAt(0) })
    input.element.value = partial.slice(0, index) + digit + partial.slice(index)
    input.element.setSelectionRange(index + 1, index + 1)
    input.element.dispatchEvent(new InputEvent('input', { data: digit, inputType: 'insertText', bubbles: true }))
    await settle()
    expect(input.element.value).toBe(after)
    // Restoring the original date should not emit a redundant model update.
    expect(wrapper.emitted('update:modelValue')).toEqual(date === '2026-05-20' ? undefined : [[date]])
  })
})

describe('date picker views', () => {
  function picker() {
    const wrapper = mount(DatePicker, {
      props: { modelValue: '2026-05-20' },
      global: {
        mocks: { $t: (key: string) => key },
        stubs: {
          Btn: defineComponent({
            props: ['label'],
            setup(props, { attrs }) {
              return () => h('button', { type: 'button', ...attrs }, props.label)
            },
          }),
          DatePickerDay: defineComponent({
            props: ['day', 'disabled'],
            setup(props, { attrs }) {
              return () => h('button', { ...attrs, 'disabled': props.disabled, 'data-date': props.day.dateString }, props.day.dateString)
            },
          }),
        },
      },
    })
    disposers.push(() => wrapper.unmount())
    return wrapper
  }

  it('replaces years with months and commits only after selecting a day', async () => {
    const wrapper = picker()
    await wrapper.get('[data-picker-years]').trigger('click')
    expect(wrapper.find('[data-picker-year-grid]').exists()).toBe(true)
    await wrapper.get('[data-picker-months]').trigger('click')
    expect(wrapper.find('[data-picker-year-grid]').exists()).toBe(false)
    expect(wrapper.find('[data-picker-month-grid]').exists()).toBe(true)
    await wrapper.get('[data-picker-years]').trigger('click')
    await wrapper.get('[data-picker-year="2027"]').trigger('click')
    expect(wrapper.find('[data-picker-year-grid]').exists()).toBe(false)
    expect(wrapper.find('[data-picker-month-grid]').exists()).toBe(true)
    await wrapper.get('[data-picker-month="5"]').trigger('click')
    expect(wrapper.find('[data-picker-month-grid]').exists()).toBe(false)
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    await wrapper.get('[data-date="2027-06-20"]').trigger('click')
    const value = wrapper.emitted('update:modelValue')?.[0]?.[0] as { format: (pattern: string) => string }
    expect(value.format('YYYY-MM-DD')).toBe('2027-06-20')
  })

  it('accepts a typed year without committing a day or partial year', async () => {
    const wrapper = picker()
    const year = wrapper.get('[data-picker-years]')
    await year.trigger('focus')
    await year.setValue('203')
    expect(wrapper.find('[data-picker-year="2026"]').exists()).toBe(true)
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    await year.setValue('2035')
    expect(wrapper.get('[data-picker-year="2035"]').attributes('aria-pressed')).toBe('true')
    await year.trigger('keydown', { key: 'Enter' })
    expect(wrapper.find('[data-picker-year-grid]').exists()).toBe(false)
    expect(wrapper.find('[data-date="2035-05-20"]').exists()).toBe(true)
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    await wrapper.get('[data-picker-next-month]').trigger('click')
    expect(wrapper.find('[data-date="2035-06-20"]').exists()).toBe(true)
    await wrapper.get('[data-picker-next]').trigger('click')
    expect(wrapper.find('[data-date="2036-06-20"]').exists()).toBe(true)
  })

  it('pages years in groups of twelve without changing the selected date', async () => {
    const wrapper = picker()
    await wrapper.get('[data-picker-years]').trigger('click')
    const first = Number(wrapper.get('[data-picker-year]').attributes('data-picker-year'))
    await wrapper.get('[data-picker-next]').trigger('click')
    expect(Number(wrapper.get('[data-picker-year]').attributes('data-picker-year'))).toBe(first + 12)
    await wrapper.get('[data-picker-previous]').trigger('click')
    expect(Number(wrapper.get('[data-picker-year]').attributes('data-picker-year'))).toBe(first)
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    await wrapper.get('[data-picker-years]').trigger('keydown', { key: 'Escape' })
    expect(wrapper.find('[data-picker-year-grid]').exists()).toBe(false)
  })

  it('moves by years in the month view and preserves disabled dates', async () => {
    const wrapper = picker()
    await wrapper.get('[data-picker-months]').trigger('click')
    await wrapper.get('[data-picker-next]').trigger('click')
    expect((wrapper.get('[data-picker-years]').element as HTMLInputElement).value).toBe('2027')
    await wrapper.get('[data-picker-month="5"]').trigger('click')
    await wrapper.setProps({ disabledDays: ['2027-06-20'] })
    expect(wrapper.get('[data-date="2027-06-20"]').attributes('disabled')).toBeDefined()
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })
})

// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { computed, createVaporApp, nextTick, reactive, shallowReactive, shallowRef } from 'vue'
import type { VaporComponent } from 'vue'
import type { Dayjs } from 'dayjs'
import NumberInput from '../NumberInput/NumberInput.vue'
import TextArea from '../TextArea/TextArea.vue'
import CurrencyInput from '../CurrencyInput/CurrencyInput.vue'
import DateInput from '../DateInput/DateInput.vue'
import DatePicker from '../../DatePicker/DatePicker.vue'
import NativeInputHost from '../../../../tests/fixtures/NativeInputHost.vue'

// Keep the original unit isolation, but compile every component stub as Vapor.
// Actual layout, buttons, calendar cells and overlays are covered by browser tests.
vi.mock('../../InputWrapper/InputWrapper.vue', () => import('../../../../tests/fixtures/InputWrapperStub.vue'))
vi.mock('../../Button/Btn.vue', () => import('../../../../tests/fixtures/ButtonStub.vue'))
vi.mock('../../DatePicker/DatePickerDay.vue', () => import('../../../../tests/fixtures/DatePickerDayStub.vue'))
vi.mock('../../../../../Utilities/app/utils/$t', () => ({ $t: (key: string) => key }))
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

const testLocale = reactive({ code: 'cs-CZ' })
const disposers: Array<() => void> = []

afterEach(() => {
  disposers.splice(0).forEach(dispose => dispose())
  vi.restoreAllMocks()
  testLocale.code = 'cs-CZ'
})

async function settle() {
  for (let i = 0; i < 5; i++) {
    await nextTick()
  }
}

function mountInput(component: VaporComponent, initialProps: Record<string, unknown>) {
  const props = shallowReactive({ ...initialProps })
  const container = document.createElement('div')
  // Delegated Vapor events require a connected DOM tree.
  document.body.append(container)
  const app = createVaporApp(NativeInputHost, {
    component: () => component,
    inputProps: () => props,
  })
  app.config.globalProperties.$t = (key: string) => key
  disposers.push(() => {
    app.unmount()
    container.remove()
  })
  // No interop plugin: an accidental VDOM boundary must fail these tests.
  app.mount(container)

  function get<T extends HTMLElement = HTMLElement>(selector: string) {
    const element = container.querySelector<T>(selector)
    if (!element) {
      throw new Error(`Missing native input test element: ${selector}`)
    }

    return element
  }

  return {
    props,
    container,
    get,
    async setProps(values: Record<string, unknown>) {
      Object.assign(props, values)
      await settle()
    },
    async click(selector: string) {
      get(selector).click()
      await settle()
    },
  }
}

async function fill(input: HTMLInputElement | HTMLTextAreaElement, value: string) {
  input.value = value
  input.dispatchEvent(new InputEvent('input', { bubbles: true }))
  await settle()
}

describe('native numeric input components', () => {
  it.each([undefined, 12])('keeps edits local without v-model (initial %s)', async initial => {
    const owner = mountInput(NumberInput, {
      ...(initial === undefined ? {} : { modelValue: initial }),
      emptyValue: null,
    })
    await settle()
    const input = owner.get<HTMLInputElement>('input')
    // Do not install an update listener: that would turn the one-way prop into
    // a controlled model and stop exercising the original local-state contract.
    await fill(input, '34')
    expect(input.value).toBe('34')
    expect(owner.props.modelValue).toBe(initial)
    await owner.setProps({ modelValue: 56 })
    expect(input.value).toBe('56')
    await fill(input, '78')
    expect(input.value).toBe('78')
    expect(owner.props.modelValue).toBe(56)
    await owner.setProps({ modelValue: undefined })
    expect(input.value).toBe('')
  })

  it('declares TextArea model updates on the owning component', async () => {
    const update = vi.fn()
    const owner = mountInput(TextArea, {
      'modelValue': 'before',
      'onUpdate:modelValue': update,
      'mask': { mask: /.*/ },
    })
    await settle()
    const input = owner.get<HTMLTextAreaElement>('textarea')
    await fill(input, 'after')
    expect(update).toHaveBeenCalledExactlyOnceWith('after')
    expect(owner.props.modelValue).toBe('before')
    await owner.setProps({ modelValue: 'accepted' })
    expect(input.value).toBe('accepted')
  })

  it('emits a numeric edit once while the parent decides whether to accept it', async () => {
    const update = vi.fn()
    const owner = mountInput(NumberInput, { 'modelValue': 12, 'onUpdate:modelValue': update })
    await settle()
    const input = owner.get<HTMLInputElement>('input')
    await fill(input, '34')
    expect(input.value).toBe('34')
    expect(owner.props.modelValue).toBe(12)
    expect(update.mock.calls).toEqual([[34]])
    await owner.setProps({ modelValue: 34 })
    expect(input.value).toBe('34')
    expect(update.mock.calls).toEqual([[34]])
    await owner.setProps({ modelValue: 56 })
    expect(input.value).toBe('56')
    expect(update.mock.calls).toEqual([[34]])
  })

  it('updates NumberInput from an external model and from paste', async () => {
    const update = vi.fn()
    const owner = mountInput(NumberInput, { 'modelValue': null, 'emptyValue': null, 'onUpdate:modelValue': update })
    await settle()
    const input = owner.get<HTMLInputElement>('input')
    expect(input.value).toBe('')
    await owner.setProps({ modelValue: 0 })
    expect(input.value).toBe('0')
    await owner.setProps({ modelValue: null })
    expect(input.value).toBe('')
    const clipboardData = new DataTransfer()
    clipboardData.setData('text', '0')
    input.dispatchEvent(new ClipboardEvent('paste', { clipboardData, bubbles: true, cancelable: true }))
    await settle()
    expect(input.value).toBe('0')
    expect(update.mock.calls).toEqual([[0]])
  })

  it('formats CurrencyInput zero for external updates and beforeinput', async () => {
    const update = vi.fn()
    const owner = mountInput(CurrencyInput, {
      'modelValue': null,
      'emptyValue': null,
      'noCurrency': true,
      'onUpdate:modelValue': update,
    })
    await settle()
    const input = owner.get<HTMLInputElement>('input')
    await owner.setProps({ modelValue: 0 })
    expect(input.value).toBe('0,00')
    await owner.setProps({ modelValue: null })
    expect(input.value).toBe('')

    input.dispatchEvent(new InputEvent('beforeinput', { data: '0', inputType: 'insertText', bubbles: true, cancelable: true }))
    await settle()
    expect(input.value).toBe('0,00')
    expect(update.mock.calls).toEqual([[0]])

    await owner.setProps({ modelValue: 0 })
    input.setSelectionRange(0, input.value.length)
    input.dispatchEvent(new InputEvent('beforeinput', { inputType: 'deleteContentBackward', bubbles: true, cancelable: true }))
    await settle()
    expect(input.value).toBe('')
    expect(update.mock.calls).toEqual([[0], [null]])
  })
})

describe('native date input editing', () => {
  it.each(['2026-05-20', null])('restores the last valid date %s when changing locale during editing', async value => {
    const update = vi.fn()
    const owner = mountInput(DateInput, { 'modelValue': value, 'format': 'YYYY-MM-DD', 'onUpdate:modelValue': update })
    await settle()
    const input = owner.get<HTMLInputElement>('input')
    await fill(input, '21')
    expect(update).not.toHaveBeenCalled()
    testLocale.code = 'en-US'
    await settle()
    expect(input.value).toBe(value ? '05/20/2026' : 'MM/DD/YYYY')
    expect(update).not.toHaveBeenCalled()
    await fill(input, '06/22/2026')
    expect(update.mock.calls).toEqual([['2026-06-22']])
  })

  it('keeps the Dayjs model unchanged and uses the new locale for subsequent model updates', async () => {
    const { $date } = await import('../../../../../Utilities/shared/utils/$date')
    const update = vi.fn()
    const value = $date('2026-12-09', { utc: false })
    const owner = mountInput(DateInput, { 'modelValue': value, 'onUpdate:modelValue': update })
    await settle()
    expect(update, 'no emission on initial mount').not.toHaveBeenCalled()
    testLocale.code = 'en-US'
    await settle()
    expect(owner.get<HTMLInputElement>('input').value).toBe('12/09/2026')
    expect(update).not.toHaveBeenCalled()
    await owner.setProps({ modelValue: $date('2026-05-20', { utc: false }) })
    expect(owner.get<HTMLInputElement>('input').value).toBe('05/20/2026')
    expect(update).not.toHaveBeenCalled()
  })

  it.each(['2026-12-09', '2026-05-20', null])('preserves %s across locale changes without emitting', async value => {
    const update = vi.fn()
    const owner = mountInput(DateInput, { 'modelValue': value, 'format': 'YYYY-MM-DD', 'onUpdate:modelValue': update })
    await settle()
    const input = owner.get<HTMLInputElement>('input')
    const before = input.value
    testLocale.code = 'en-US'
    await settle()
    expect(input.value).toBe(value === null ? 'MM/DD/YYYY' : value === '2026-12-09' ? '12/09/2026' : '05/20/2026')
    expect(update).not.toHaveBeenCalled()
    testLocale.code = 'cs-CZ'
    await settle()
    expect(input.value).toBe(before)
    expect(update).not.toHaveBeenCalled()
  })

  it.each(['typing', 'paste'])('pads a single-digit month during compact date entry by %s', async method => {
    const update = vi.fn()
    const owner = mountInput(DateInput, { 'modelValue': null, 'format': 'YYYY-MM-DD', 'onUpdate:modelValue': update })
    await settle()
    const input = owner.get<HTMLInputElement>('input')

    if (method === 'paste') {
      await fill(input, '2062026')
    } else {
      for (const digit of '2062026') {
        const index = input.value.search(/[DMY]/)
        input.setSelectionRange(index, index)
        input.dispatchEvent(new KeyboardEvent('keydown', { key: digit, keyCode: digit.charCodeAt(0), bubbles: true }))
        const value = input.value
        input.value = value.slice(0, index) + digit + value.slice(index)
        input.setSelectionRange(index + 1, index + 1)
        input.dispatchEvent(new InputEvent('input', { data: digit, inputType: 'insertText', bubbles: true }))
        await settle()
      }
    }

    expect(input.value).toBe('20.06.2026')
    expect(update.mock.calls).toEqual([['2026-06-20']])
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
    const update = vi.fn()
    const owner = mountInput(DateInput, { 'modelValue': '2026-05-20', 'format': 'YYYY-MM-DD', 'onUpdate:modelValue': update })
    await settle()
    const input = owner.get<HTMLInputElement>('input')
    expect(input.value).toBe(before)
    const cursor = key === 'Backspace' ? index + 1 : index
    input.setSelectionRange(cursor, cursor)
    input.dispatchEvent(new KeyboardEvent('keydown', { key, keyCode: key === 'Backspace' ? 8 : 46, bubbles: true }))
    input.value = before.slice(0, index) + before.slice(index + 1)
    input.setSelectionRange(index, index)
    input.dispatchEvent(new InputEvent('input', {
      inputType: key === 'Backspace' ? 'deleteContentBackward' : 'deleteContentForward',
      bubbles: true,
    }))
    await settle()
    expect(input.value).toBe(partial)
    expect(update).not.toHaveBeenCalled()

    input.setSelectionRange(index, index)
    input.dispatchEvent(new KeyboardEvent('keydown', { key: digit, keyCode: digit.charCodeAt(0), bubbles: true }))
    input.value = partial.slice(0, index) + digit + partial.slice(index + 1)
    input.setSelectionRange(index + 1, index + 1)
    input.dispatchEvent(new InputEvent('input', { data: digit, inputType: 'insertText', bubbles: true }))
    await settle()
    expect(input.value).toBe(after)
    // Restoring the original date should not emit a redundant model update.
    expect(update.mock.calls).toEqual(date === '2026-05-20' ? [] : [[date]])
  })
})

describe('native date picker views', () => {
  function picker() {
    const update = vi.fn()
    const owner = mountInput(DatePicker, { 'modelValue': '2026-05-20', 'onUpdate:modelValue': update })

    return { ...owner, update }
  }

  it('replaces years with months and commits only after selecting a day', async () => {
    const owner = picker()
    await owner.click('[data-picker-years]')
    expect(owner.container.querySelector('[data-picker-year-grid]')).not.toBeNull()
    await owner.click('[data-picker-months]')
    // Native Transition keeps the leaving grid until its animation frames end.
    await vi.waitFor(() => expect(owner.container.querySelector('[data-picker-year-grid]')).toBeNull())
    expect(owner.container.querySelector('[data-picker-month-grid]')).not.toBeNull()
    await owner.click('[data-picker-years]')
    await vi.waitFor(() => expect(owner.container.querySelector('[data-picker-month-grid]')).toBeNull())
    await owner.click('[data-picker-year="2027"]')
    await vi.waitFor(() => expect(owner.container.querySelector('[data-picker-year-grid]')).toBeNull())
    expect(owner.container.querySelector('[data-picker-month-grid]')).not.toBeNull()
    await owner.click('[data-picker-month="5"]')
    expect(owner.container.querySelector('[data-picker-month-grid]')).toBeNull()
    expect(owner.update).not.toHaveBeenCalled()
    await owner.click('[data-date="2027-06-20"]')
    const value = owner.update.mock.calls[0][0] as Dayjs
    expect(value.format('YYYY-MM-DD')).toBe('2027-06-20')
  })

  it('accepts a typed year without committing a day or partial year', async () => {
    const owner = picker()
    const year = owner.get<HTMLInputElement>('[data-picker-years]')
    year.focus()
    await fill(year, '203')
    expect(owner.container.querySelector('[data-picker-year="2026"]')).not.toBeNull()
    expect(owner.update).not.toHaveBeenCalled()
    await fill(year, '2035')
    expect(owner.get('[data-picker-year="2035"]').getAttribute('aria-pressed')).toBe('true')
    year.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }))
    await settle()
    expect(owner.container.querySelector('[data-picker-year-grid]')).toBeNull()
    expect(owner.container.querySelector('[data-date="2035-05-20"]')).not.toBeNull()
    expect(owner.update).not.toHaveBeenCalled()
    await owner.click('[data-picker-next-month]')
    expect(owner.container.querySelector('[data-date="2035-06-20"]')).not.toBeNull()
    await owner.click('[data-picker-next]')
    expect(owner.container.querySelector('[data-date="2036-06-20"]')).not.toBeNull()
  })

  it('pages years in groups of twenty-four without changing the selected date', async () => {
    const owner = picker()
    await owner.click('[data-picker-years]')
    expect(owner.container.querySelectorAll('[data-picker-year]')).toHaveLength(24)
    const first = Number(owner.get('[data-picker-year]').getAttribute('data-picker-year'))
    await owner.click('[data-picker-next]')
    await vi.waitFor(() => expect(Number(owner.get('[data-picker-year]').getAttribute('data-picker-year'))).toBe(first + 24))
    await owner.click('[data-picker-previous]')
    await vi.waitFor(() => expect(Number(owner.get('[data-picker-year]').getAttribute('data-picker-year'))).toBe(first))
    expect(owner.update).not.toHaveBeenCalled()
    owner.get('[data-picker-years]').dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }))
    await settle()
    expect(owner.container.querySelector('[data-picker-year-grid]')).toBeNull()
  })

  it('moves by years in the month view and preserves disabled dates', async () => {
    const owner = picker()
    await owner.click('[data-picker-months]')
    await owner.click('[data-picker-next]')
    expect(owner.get<HTMLInputElement>('[data-picker-years]').value).toBe('2027')
    await owner.click('[data-picker-month="5"]')
    const { $date } = await import('../../../../../Utilities/shared/utils/$date')
    await owner.setProps({ disabledDays: [$date('2027-06-20')] })
    const day = owner.get<HTMLButtonElement>('[data-date="2027-06-20"]')
    expect(day.disabled).toBe(true)
    day.click()
    await settle()
    expect(owner.update).not.toHaveBeenCalled()
  })
})

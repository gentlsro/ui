// @vitest-environment happy-dom
import IMask, { createMask } from 'imask'
import { describe, expect, it } from 'vitest'

// Functions
import { getTimePeriod, toDisplayHour, toStoredHour } from '../../functions/time-format'
import {
  createDateTimeMask,
  formatMaskedDateTime,
  getDateTimeMaskExpression,
  getDateTimeMaskPattern,
  isDateTimeMaskValue,
  parseMaskedDateTime,
} from './masked-datetime'

const CS = 'DD.MM.YYYY'
const US = 'MM/DD/YYYY'

/**
 * The component stores a `Datetime`, the mask only needs something that can be
 * split into the two display segments – a plain string keeps this spec free of
 * any Nuxt auto-imports.
 */
type TestValue = { date: string, time: string }

function createTestMaskOptions(datePattern: string, is12h: boolean) {
  return createDateTimeMask({
    datePattern,
    is12h,
    fromValue: value => (value as TestValue | undefined),
    toValue: ({ date, time }) => ({ date, time }) satisfies TestValue,
  })
}

/** Types into a mask the way IMask does for every single keystroke. */
function typeIntoMask(datePattern: string, is12h: boolean, input: string) {
  const options = createTestMaskOptions(datePattern, is12h)
  const mask = createMask(options)

  for (const char of input) {
    mask.append(char)
  }

  return { mask, options }
}

describe('date time mask shape', () => {
  it('builds a 24h mask out of the locale date format', () => {
    expect(getDateTimeMaskPattern(CS, false)).toBe('DD.MM.YYYY HH:mm')
    expect(getDateTimeMaskExpression(CS, false)).toBe('`DD.`MM.`YYYY `HH:mm')
  })

  it('adds an AM/PM block for 12h locales', () => {
    expect(getDateTimeMaskPattern(US, true)).toBe('MM/DD/YYYY HH:mm AA')
    expect(getDateTimeMaskExpression(US, true)).toBe('`MM/`DD/`YYYY `HH:mm AA')
  })
})

describe('isDateTimeMaskValue', () => {
  it('accepts partially and fully filled masks', () => {
    expect(isDateTimeMaskValue('', CS, false)).toBe(true)
    expect(isDateTimeMaskValue('DD.MM.YYYY HH:mm', CS, false)).toBe(true)
    expect(isDateTimeMaskValue('20.0M.2026', CS, false)).toBe(true)
    expect(isDateTimeMaskValue('20.06.2026 13:45', CS, false)).toBe(true)
    expect(isDateTimeMaskValue('06/20/2026 01:45 PM', US, true)).toBe(true)
  })

  it('rejects anything that is not a value of this mask', () => {
    expect(isDateTimeMaskValue('2026-06-20', CS, false)).toBe(false)
    expect(isDateTimeMaskValue('2026-06-20T10:00:00Z', CS, false)).toBe(false)
    expect(isDateTimeMaskValue('20/06/2026', CS, false)).toBe(false)
  })
})

describe('parseMaskedDateTime', () => {
  it('reads a fully filled 24h value', () => {
    expect(parseMaskedDateTime('20.06.2026 13:45', CS, false)).toEqual({
      date: '20.06.2026',
      time: '13:45',
    })
  })

  it('converts a 12h value into a stored 24h time', () => {
    expect(parseMaskedDateTime('06/20/2026 01:45 PM', US, true)).toEqual({
      date: '06/20/2026',
      time: '13:45',
    })

    expect(parseMaskedDateTime('06/20/2026 12:05 AM', US, true)).toEqual({
      date: '06/20/2026',
      time: '00:05',
    })

    expect(parseMaskedDateTime('06/20/2026 12:05 PM', US, true)).toEqual({
      date: '06/20/2026',
      time: '12:05',
    })
  })

  it('returns nothing while any block is still empty', () => {
    expect(parseMaskedDateTime('DD.MM.YYYY HH:mm', CS, false)).toBeUndefined()
    expect(parseMaskedDateTime('20.0M.2026', CS, false)).toBeUndefined()
    expect(parseMaskedDateTime('20.06.2026 HH:mm', CS, false)).toBeUndefined()
    expect(parseMaskedDateTime('20.06.2026 13:mm', CS, false)).toBeUndefined()
    expect(parseMaskedDateTime('06/20/2026 01:45 AA', US, true)).toBeUndefined()
  })
})

describe('formatMaskedDateTime', () => {
  it('renders the stored time the way the locale expects it', () => {
    expect(formatMaskedDateTime('20.06.2026', '13:45', false)).toBe('20.06.2026 13:45')
    expect(formatMaskedDateTime('06/20/2026', '13:45', true)).toBe('06/20/2026 01:45 PM')
    expect(formatMaskedDateTime('06/20/2026', '00:05', true)).toBe('06/20/2026 12:05 AM')
  })

  it('returns nothing for a partial time', () => {
    expect(formatMaskedDateTime('20.06.2026', '13:m5', false)).toBeUndefined()
  })
})

describe('date time mask input', () => {
  it('shows the placeholders while the value is empty', () => {
    const el = document.createElement('input')
    document.body.append(el)

    IMask(el, { mask: createMask(createTestMaskOptions(CS, false)) } as any)

    expect(el.value).toBe('DD.MM.YYYY HH:mm')
  })

  it('fills the value block by block', () => {
    expect(typeIntoMask(CS, false, '20').mask.value).toBe('20')
    expect(typeIntoMask(CS, false, '200').mask.value).toBe('20.0')
    expect(typeIntoMask(CS, false, '20062026').mask.value).toBe('20.06.2026')
    expect(typeIntoMask(CS, false, '2006202613').mask.value).toBe('20.06.2026 13')

    const { mask } = typeIntoMask(CS, false, '200620261345')

    expect(mask.value).toBe('20.06.2026 13:45')
    expect(mask.isComplete).toBe(true)
    expect(mask.typedValue).toEqual({ date: '20.06.2026', time: '13:45' })
  })

  it('reports an incomplete value until the very last block is filled', () => {
    expect(typeIntoMask(CS, false, '200620261345').mask.isComplete).toBe(true)
    expect(typeIntoMask(CS, false, '20062026134').mask.isComplete).toBe(false)
    expect(typeIntoMask(CS, false, '20062026').mask.isComplete).toBe(false)
  })

  it('accepts the period of a 12h locale in any case', () => {
    for (const period of ['p', 'P', 'pm', 'PM']) {
      const { mask } = typeIntoMask(US, true, `062020260145${period}`)

      expect(mask.value).toBe('06/20/2026 01:45 PM')
      expect(mask.typedValue).toEqual({ date: '06/20/2026', time: '13:45' })
    }
  })

  /**
   * `useInputUtils` writes the parsed value back into the mask on every accepted
   * input. IMask skips that write when `format` renders both values the same way,
   * which is what keeps a half typed value on screen instead of resetting it.
   */
  it.each([
    { input: '2', datePattern: CS, is12h: false, isDraft: true },
    { input: '200', datePattern: CS, is12h: false, isDraft: true },
    { input: '20062026', datePattern: CS, is12h: false, isDraft: true },
    { input: '2006202613', datePattern: CS, is12h: false, isDraft: true },
    { input: '200620261345', datePattern: CS, is12h: false, isDraft: false },
    { input: '062020260145', datePattern: US, is12h: true, isDraft: true },
    { input: '062020260145p', datePattern: US, is12h: true, isDraft: false },
  ])('keeps $input on screen when the parsed value is written back', ({ input, datePattern, is12h, isDraft }) => {
    const { mask, options } = typeIntoMask(datePattern, is12h, input)
    const typed = mask.typedValue

    // A half filled value stays the raw draft, a complete one becomes a value
    if (isDraft) {
      expect(typed).toBe(mask.value)
    } else {
      expect(typed).toEqual(expect.objectContaining({ time: expect.any(String) }))
    }

    expect((options.format as any)(typed, mask)).toBe(mask.value)
    expect(mask.typedValueEquals(typed)).toBe(true)
  })

  it('resets to the placeholders when the value is cleared', () => {
    const { mask, options } = typeIntoMask(CS, false, '200620261345')

    mask.typedValue = undefined

    expect((options.format as any)(undefined, mask)).toBe('DD.MM.YYYY HH:mm')
  })
})

describe('time conversions', () => {
  it('converts between the stored and the displayed hour', () => {
    expect(toDisplayHour('00', true)).toBe('12')
    expect(toDisplayHour('13', true)).toBe('01')
    expect(toDisplayHour('12', true)).toBe('12')
    expect(toDisplayHour('13', false)).toBe('13')

    expect(toStoredHour('01', true, false)).toBe('13')
    expect(toStoredHour('12', true, true)).toBe('00')
    expect(toStoredHour('12', true, false)).toBe('12')
    expect(toStoredHour('13', false, true)).toBe('13')
  })

  it('reads the period of a stored hour', () => {
    expect(getTimePeriod('00')).toBe('AM')
    expect(getTimePeriod('11')).toBe('AM')
    expect(getTimePeriod('12')).toBe('PM')
    expect(getTimePeriod('23')).toBe('PM')
  })
})

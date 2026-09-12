import { MaskedEnum, MaskedRange } from 'imask'
import type { FactoryOpts } from 'imask'

// Functions
import { MaskedDateRange } from '../../DateInput/functions/masked-date-range'
import { getTimePeriod, parseTimeParts, TIME_PERIODS, toDisplayHour, toStoredHour } from '../../functions/time-format'

/**
 * Tokens the date part of the mask is built from. They are the tokens
 * `getCurrentLocaleDateFormat()` returns (`DD.MM.YYYY`, `MM/DD/YYYY`, ...), so
 * the value is displayed in the order the current locale expects.
 */
const DATE_PATTERN_TOKENS = /DD|MM|YYYY/g

/** Characters IMask leaves behind while a block is not filled in yet. */
const MASK_PLACEHOLDERS: Record<string, string> = {
  D: '\\d',
  M: '\\d',
  Y: '\\d',
  H: '\\d',
  m: '\\d',
  A: 'ALPHA',
}

export const DATE_TIME_MASK_TIME_24H = 'HH:mm'
export const DATE_TIME_MASK_TIME_12H = 'HH:mm AA'

export function getDateTimeMaskTimePattern(is12h: boolean) {
  return is12h ? DATE_TIME_MASK_TIME_12H : DATE_TIME_MASK_TIME_24H
}

/** The value IMask displays while nothing is filled in, eg. `DD.MM.YYYY HH:mm`. */
export function getDateTimeMaskPattern(datePattern: string, is12h: boolean) {
  return `${datePattern} ${getDateTimeMaskTimePattern(is12h)}`
}

/**
 * The IMask expression. Backticks are IMask stop characters: they keep the date
 * blocks – and the time block – independent when editing in the middle of the
 * value. They are not part of the displayed value.
 */
export function getDateTimeMaskExpression(datePattern: string, is12h: boolean) {
  const dateExpression = datePattern.replace(DATE_PATTERN_TOKENS, block => `\`${block}`)

  return `${dateExpression} \`${getDateTimeMaskTimePattern(is12h)}`
}

/** `MaskedEnum` matches case sensitively – accept `a`, `am` and `AM`. */
function matchPeriod(period: string, value: string, matchFrom: number) {
  return period.toLowerCase().indexOf(value.toLowerCase(), matchFrom) === matchFrom
}

export function getDateTimeMaskBlocks(is12h: boolean): Record<string, FactoryOpts> {
  return {
    DD: { mask: MaskedDateRange, placeholderChar: 'D', autofix: 'pad', from: 1, to: 31, maxLength: 2 },
    MM: { mask: MaskedDateRange, placeholderChar: 'M', autofix: 'pad', from: 1, to: 12, maxLength: 2 },
    YYYY: { mask: MaskedDateRange, placeholderChar: 'Y', autofix: 'pad', from: 1900, to: 2999, maxLength: 4 },

    HH: {
      mask: MaskedRange,
      placeholderChar: 'H',
      autofix: 'pad',
      from: is12h ? 1 : 0,
      to: is12h ? 12 : 23,
      maxLength: 2,
    },
    mm: { mask: MaskedRange, placeholderChar: 'm', autofix: 'pad', from: 0, to: 59, maxLength: 2 },

    ...(is12h
      ? { AA: { mask: MaskedEnum, placeholderChar: 'A', enum: TIME_PERIODS, matchValue: matchPeriod } }
      : {}),
  }
}

/** Matches the date segment once every one of its blocks is filled in. */
function getDateValueRe(datePattern: string) {
  const expression = datePattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replace(DATE_PATTERN_TOKENS, token => `\\d{${token.length}}`)

  return new RegExp(`^${expression}$`)
}

/** Every character a block accepts while it is being filled in. */
const MASK_DIGIT_RE = /\d/

/** The 12h period block is an enum of letters, so it takes any letter. */
const MASK_LETTER_RE = /[a-z]/i

function isMaskChar(char: string, patternChar: string) {
  const placeholder = MASK_PLACEHOLDERS[patternChar]

  if (!placeholder) {
    return char === patternChar
  }

  if (placeholder === 'ALPHA') {
    return MASK_LETTER_RE.test(char)
  }

  return char === patternChar || MASK_DIGIT_RE.test(char)
}

/**
 * Whether the value already is a value of this mask.
 *
 * IMask only renders the blocks up to the cursor, so a partially filled value is
 * a *prefix* of the mask pattern rather than a full length value. Used to tell
 * such a draft apart from an actual model value while formatting.
 */
export function isDateTimeMaskValue(value: string, datePattern: string, is12h: boolean) {
  const maskPattern = getDateTimeMaskPattern(datePattern, is12h)

  if (value.length > maskPattern.length) {
    return false
  }

  for (let charIdx = 0; charIdx < value.length; charIdx++) {
    if (!isMaskChar(value[charIdx]!, maskPattern[charIdx]!)) {
      return false
    }
  }

  return true
}

/** Splits a displayed value into its date and time segments. */
export function splitDateTimeMaskValue(value: string, datePattern: string) {
  return {
    date: value.slice(0, datePattern.length),
    time: value.slice(datePattern.length + 1),
  }
}

export type IDateTimeMaskSegments = {
  /** The date, formatted the way the current locale expects it */
  date: string

  /** The time, always stored as a 24h `HH:mm` */
  time: string
}

/**
 * Reads a fully filled masked value.
 *
 * Returns `undefined` while any of the blocks is still empty, so the caller can
 * keep displaying the partial value without committing it to the model.
 */
export function parseMaskedDateTime(value: string, datePattern: string, is12h: boolean) {
  const { date, time } = splitDateTimeMaskValue(value, datePattern)

  if (!getDateValueRe(datePattern).test(date)) {
    return undefined
  }

  const parts = parseTimeParts(time.slice(0, DATE_TIME_MASK_TIME_24H.length))

  if (!parts) {
    return undefined
  }

  const period = time.slice(DATE_TIME_MASK_TIME_24H.length + 1)

  if (is12h && !TIME_PERIODS.includes(period)) {
    return undefined
  }

  const isAm = is12h ? period === 'AM' : Number(parts.hh) < 12

  return {
    date,
    time: `${toStoredHour(parts.hh, is12h, isAm)}:${parts.mm}`,
  } satisfies IDateTimeMaskSegments
}

/** Renders a locale formatted date and a stored 24h time as the masked value. */
export function formatMaskedDateTime(date: string, time: string, is12h: boolean) {
  const parts = parseTimeParts(time)

  if (!parts) {
    return undefined
  }

  const period = is12h ? ` ${getTimePeriod(parts.hh)}` : ''

  return `${date} ${toDisplayHour(parts.hh, is12h)}:${parts.mm}${period}`
}

export type IDateTimeMaskFactoryOptions = {
  datePattern: string

  /** The value that stands for "nothing is filled in" */
  emptyValue?: any

  is12h: boolean

  /**
   * Renders a stored value into the two display segments.
   *
   * Returning `undefined` falls back to the empty mask.
   */
  fromValue: (value: any) => IDateTimeMaskSegments | undefined

  /**
   * Turns the display segments into the value stored in the model.
   *
   * Returning `undefined` leaves the mask with the partial display value.
   */
  toValue: (segments: IDateTimeMaskSegments) => any
}

/**
 * Builds the IMask options of a single input holding both a date and a time.
 *
 * While the value is only partially filled in, `parse` hands the display value
 * back untouched. `format` recognizes such a draft and returns it as is, so the
 * user always sees exactly what was typed until every block is filled in.
 */
export function createDateTimeMask(options: IDateTimeMaskFactoryOptions): FactoryOpts {
  const { datePattern, emptyValue, is12h, fromValue, toValue } = options
  const maskPattern = getDateTimeMaskPattern(datePattern, is12h)

  function isEmpty(val: any) {
    return val === '' || val === null || val === undefined || val === emptyValue
  }

  return {
    lazy: false,
    overwrite: true,
    mask: getDateTimeMaskExpression(datePattern, is12h),
    pattern: maskPattern,
    blocks: getDateTimeMaskBlocks(is12h),
    format: (val: any) => {
      if (isEmpty(val)) {
        return maskPattern
      }

      if (typeof val === 'string' && isDateTimeMaskValue(val, datePattern, is12h)) {
        return val
      }

      const segments = fromValue(val)

      if (!segments) {
        return maskPattern
      }

      return formatMaskedDateTime(segments.date, segments.time, is12h) ?? maskPattern
    },
    parse: (val: any) => {
      if (isEmpty(val)) {
        return emptyValue
      }

      if (typeof val !== 'string') {
        return val
      }

      const segments = parseMaskedDateTime(val, datePattern, is12h)

      if (!segments) {
        return val
      }

      const value = toValue(segments)

      return value === undefined ? val : value
    },
  }
}

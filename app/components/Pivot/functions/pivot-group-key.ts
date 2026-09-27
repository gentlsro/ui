import { get } from 'lodash-es'
import type { ExtendedDataType } from '$dataType'

const PIVOT_DATE_DATA_TYPE_RE = /^(?:date|datetime|timestamp|fullDateTime|yearMonth)(?:Simple)?$/
const PIVOT_NUMBER_DATA_TYPE_RE = /^number(?:Simple)?$/
const PIVOT_PLAIN_FIELD_RE = /^[^.[\]]+$/

export type IPivotGroupKeyResolver<T = IItem> = (item: T) => string
export type IPivotGroupKeyComparator = (a: string, b: string) => number

function isPivotDateDataType(dataType?: ExtendedDataType) {
  if (!dataType) {
    return false
  }

  if (PIVOT_DATE_DATA_TYPE_RE.test(dataType)) {
    return true
  }

  // Support app-extended date types when the autoimport is available.
  return typeof getDateTypes === 'function' && getDateTypes().includes(dataType)
}

function isPivotNumberDataType(dataType?: ExtendedDataType) {
  if (!dataType) {
    return false
  }

  if (PIVOT_NUMBER_DATA_TYPE_RE.test(dataType)) {
    return true
  }

  // Support app-extended number types when the autoimport is available.
  return typeof getNumberDataTypes === 'function' && getNumberDataTypes().includes(dataType)
}

/**
 * Reads a field the way lodash `get` does, skipping the path parsing for plain keys
 */
export function createPivotFieldReader<T>(field: ObjectKey<T> | PropertyKey) {
  if (typeof field === 'string' && !PIVOT_PLAIN_FIELD_RE.test(field)) {
    return (item: T): unknown => get(item, field)
  }

  return (item: T): unknown => (item as Record<PropertyKey, unknown> | null | undefined)?.[field]
}

/**
 * Resolves the group key of a row/column field; dates group by day timestamp
 *
 * Every consumer (aggregation, row tree, column tree) must use the same resolver,
 * otherwise group paths and aggregated values stop matching.
 */
export function createPivotGroupKeyResolver<T>(
  field: ObjectKey<T> | PropertyKey,
  dataType?: ExtendedDataType,
): IPivotGroupKeyResolver<T> {
  const read = createPivotFieldReader<T>(field)

  if (!isPivotDateDataType(dataType)) {
    return item => {
      const value = read(item)

      return value == null ? '' : String(value)
    }
  }

  return item => {
    const value = read(item)

    if (value == null) {
      return ''
    }

    const timestamp = getDateSimpleValue(value as Datetime)

    return Number.isFinite(timestamp) ? String(timestamp) : ''
  }
}

function compareStrings(a: string, b: string) {
  if (a === b) {
    return 0
  }

  return a < b ? -1 : 1
}

function toFiniteNumber(key: string) {
  return key === '' ? Number.NaN : Number(key)
}

/**
 * Numeric keys sort by value; empty and non-numeric keys sort first, as strings
 */
function compareNumericKeys(a: string, b: string) {
  const aNumber = toFiniteNumber(a)
  const bNumber = toFiniteNumber(b)
  const isANumber = Number.isFinite(aNumber)
  const isBNumber = Number.isFinite(bNumber)

  if (isANumber && isBNumber) {
    return aNumber - bNumber || compareStrings(a, b)
  }

  if (isANumber !== isBNumber) {
    return isANumber ? 1 : -1
  }

  return compareStrings(a, b)
}

function createLocaleComparator(locale: string): IPivotGroupKeyComparator {
  let collator: Intl.Collator

  try {
    collator = new Intl.Collator(locale)
  } catch {
    return compareStrings
  }

  // Keys the locale considers equal (e.g. composed vs. decomposed accents) still get a stable order
  return (a, b) => collator.compare(a, b) || compareStrings(a, b)
}

/**
 * Number and date keys sort by value; text keys by the rules of `locale` (e.g. Czech `Č` after `C`, `ch` after `h`),
 * or by character code without one
 */
export function getPivotGroupKeyComparator(dataType?: ExtendedDataType, locale?: string): IPivotGroupKeyComparator {
  if (isPivotDateDataType(dataType) || isPivotNumberDataType(dataType)) {
    return compareNumericKeys
  }

  return locale ? createLocaleComparator(locale) : compareStrings
}

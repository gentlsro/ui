import dayjs from 'dayjs'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import type * as GroupKeyModule from './pivot-group-key'

/**
 * Date fields group by a day timestamp key (e.g. `'1772319600000'`). A column header shows that key, so it must be
 * turned back into the date it stands for before it is formatted. Formatting the key string itself makes the date
 * parser read its digits as `YYYYMMDD…` and a month in 2026 shows as "October 1774".
 *
 * Failure modes:
 * - a `YYYY-MM-DD` date (Postgres `date`) shows as a year in the 1700s
 * - an ISO timestamp with `Z` shows as a year in the 1700s
 * - a `YYYY-MM` value shows as a year in the 1700s
 * - a `Date` object shows as a year in the 1700s
 * - a missing value shows as a date (1970, "Invalid date") instead of an empty header
 * - a non-date key (text, number) is changed
 */

let groupKey: typeof GroupKeyModule

beforeAll(async () => {
  vi.stubGlobal('getDateTypes', () => [])
  vi.stubGlobal('getNumberDataTypes', () => ['number'])
  // Same as Utilities `getDateSimpleValue`
  vi.stubGlobal('getDateSimpleValue', (value: any) => dayjs(value).startOf('day').valueOf())
  groupKey = await import('./pivot-group-key')
})

function headerMonth(value: unknown, dataType = 'yearMonth') {
  const key = groupKey.createPivotGroupKeyResolver<any>('month', dataType as any)({ month: value })
  const displayValue = groupKey.getPivotGroupKeyValue(key, dataType as any)

  return displayValue == null ? displayValue : dayjs(displayValue as any).format('YYYY-MM')
}

describe('pivot date group key value', () => {
  it.each([
    ['a YYYY-MM-DD date', '2026-03-01'],
    ['an ISO timestamp with Z', '2026-03-01T00:00:00.000Z'],
    ['a YYYY-MM value', '2026-03'],
    ['a Date object', new Date(2026, 2, 1)],
  ])('shows the month of %s', (_, value) => {
    expect(headerMonth(value)).toBe('2026-03')
  })

  it('keeps every month of a range in its own year', () => {
    const months = ['03', '04', '05', '06', '07', '08'].map(month => headerMonth(`2026-${month}-01`))

    expect(months).toEqual(['2026-03', '2026-04', '2026-05', '2026-06', '2026-07', '2026-08'])
  })

  it('works for every date data type', () => {
    for (const dataType of ['date', 'dateSimple', 'datetime', 'timestamp', 'fullDateTime', 'yearMonthSimple']) {
      expect(headerMonth('2026-03-01', dataType)).toBe('2026-03')
    }
  })

  it('shows a missing value as empty', () => {
    expect(headerMonth(null)).toBeNull()
    expect(headerMonth(undefined)).toBeNull()
    expect(headerMonth('not a date')).toBeNull()
  })

  it('leaves text and number keys unchanged', () => {
    expect(groupKey.getPivotGroupKeyValue('20260301', 'string' as any)).toBe('20260301')
    expect(groupKey.getPivotGroupKeyValue('42', 'number' as any)).toBe('42')
    expect(groupKey.getPivotGroupKeyValue('', 'string' as any)).toBe('')
    expect(groupKey.getPivotGroupKeyValue('2026-03', undefined)).toBe('2026-03')
  })
})

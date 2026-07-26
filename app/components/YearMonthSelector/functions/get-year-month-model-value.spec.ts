import { describe, expect, it } from 'vitest'

import { getYearMonthModelValue } from './get-year-month-model-value'

const date = {
  format: (format: string) => format === 'YYYY-MM' ? '2026-04' : '',
  valueOf: () => 1_775_001_600_000,
}

describe('getYearMonthModelValue', () => {
  it('returns the timezone-free calendar period', () => {
    expect(getYearMonthModelValue({
      date,
      valueFormat: 'year-month',
    })).toBe('2026-04')
  })

  it('preserves timestamp output for compatible consumers', () => {
    expect(getYearMonthModelValue({
      date,
      valueFormat: 'timestamp',
    })).toBe(1_775_001_600_000)
  })
})

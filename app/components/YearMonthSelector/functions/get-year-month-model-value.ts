import type { YearMonthValueFormat } from '../types/year-month-selector-props.type'

type YearMonthDateValue = {
  format: (format: string) => string
  valueOf: () => number
}

export function getYearMonthModelValue(options: {
  date: YearMonthDateValue
  valueFormat: YearMonthValueFormat
}) {
  const { date, valueFormat } = options

  return valueFormat === 'year-month'
    ? date.format('YYYY-MM')
    : date.valueOf()
}

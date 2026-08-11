import { beforeAll, describe, expect, it, vi } from 'vitest'

const summary = {
  SUM: 'SUM' as SummaryEnum,
  COUNT: 'COUNT' as SummaryEnum,
  AVERAGE: 'AVERAGE' as SummaryEnum,
  MEDIAN: 'MEDIAN' as SummaryEnum,
}

let pivotGroupBy: typeof import('./pivot-group-by').pivotGroupBy
let pivotTransformDataCore: typeof import('./pivot-transform-data-core').pivotTransformDataCore

beforeAll(async () => {
  vi.stubGlobal('SummaryEnum', summary)
  vi.stubGlobal('useText', () => ({ normalizeText: (value: string) => value }))
  vi.stubGlobal('filterData', ({ data }: any) => data)
  vi.stubGlobal('$t', (key: string) => key)
  vi.stubGlobal('getDateTypes', () => [
    'date',
    'dateSimple',
    'datetime',
    'datetimeSimple',
    'timestamp',
    'timestampSimple',
    'fullDateTime',
    'fullDateTimeSimple',
    'yearMonth',
    'yearMonthSimple',
  ])
  vi.stubGlobal('getDateSimpleValue', (value: any) => {
    const date = value instanceof Date ? value : new Date(value)

    return Number.isNaN(date.getTime())
      ? Number.NaN
      : Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  })

  ;({ pivotGroupBy } = await import('./pivot-group-by'))
  ;({ pivotTransformDataCore } = await import('./pivot-transform-data-core'))
})

describe('pivot dateSimple grouping', () => {
  it('groups Date and ISO string values for the same day together', () => {
    const data = [
      { from: new Date('2024-01-15T10:00:00.000Z'), duration: 10 },
      { from: '2024-01-15', duration: 5 },
      { from: '2024-01-16', duration: 7 },
    ]

    const groups = pivotGroupBy(data, 'from', 'dateSimple')

    expect(groups.size).toBe(2)
  })

  it('transforms when dateSimple field is used as a row', () => {
    const data = [
      { from: new Date('2024-01-15T10:00:00.000Z'), duration: 10 },
      { from: new Date('2024-01-15T18:00:00.000Z'), duration: 5 },
      { from: '2024-01-16', duration: 7 },
    ]

    const result = pivotTransformDataCore({
      data,
      rows: [{
        field: 'from',
        dataType: 'dateSimple',
        minWidth: 100,
        width: '200px',
        widthResolved: '200px',
        resizable: true,
      }],
      columns: [],
      values: [{
        measureId: 'duration-sum',
        field: 'duration',
        summaryType: summary.SUM,
        widthResolved: '200px',
        _label: 'Duration',
      }],
    })

    const dataRows = result.data.filter(row => row.rowItem.kind === 'data')

    expect(dataRows).toHaveLength(2)
  })
})

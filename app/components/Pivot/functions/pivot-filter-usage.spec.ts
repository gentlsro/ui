import { beforeAll, describe, expect, it, vi } from 'vitest'

import type { buildPivotValueColumns as BuildPivotValueColumns } from './pivot-build-value-columns'
import type { pivotItemToTableColumn as PivotItemToTableColumn } from './pivot-filter-usage'
import { PivotItem } from '../models/pivot-item.model'

const ComparatorEnum = {
  EQUAL: 'eq',
  IN: 'in',
  NOT_IN: 'notIn',
} as const

vi.mock('$comparatorEnum', () => ({
  ComparatorEnum: {
    EQUAL: 'eq',
    IN: 'in',
    NOT_IN: 'notIn',
    STARTS_WITH: 'startsWith',
  },
}))

vi.mock('../../Table/models/table-column.model', () => ({
  TableColumn: class TableColumn {
    constructor(obj: Record<string, unknown>) {
      Object.assign(this, obj)
    }
  },
}))

const summary = {
  SUM: 'SUM' as SummaryEnum,
  COUNT: 'COUNT' as SummaryEnum,
  AVERAGE: 'AVERAGE' as SummaryEnum,
  MEDIAN: 'MEDIAN' as SummaryEnum,
}

let pivotItemToTableColumn: typeof PivotItemToTableColumn
let buildPivotValueColumns: typeof BuildPivotValueColumns

beforeAll(async () => {
  vi.stubGlobal('SummaryEnum', summary)
  vi.stubGlobal('stringToFloat', (value: string) => Number.parseFloat(value))
  vi.stubGlobal('getDefaultComparatorByDataType', () => ComparatorEnum.EQUAL)
  vi.stubGlobal('getNonValueComparators', () => [])
  vi.stubGlobal('FilterItem', class FilterItem {
    constructor(obj: Record<string, unknown>) {
      Object.assign(this, obj)
    }
  })

  ;({ pivotItemToTableColumn } = await import('./pivot-filter-usage'))
  ;({ buildPivotValueColumns } = await import('./pivot-build-value-columns'))
})

describe('pivot table callback bridge', () => {
  it('forwards format and getDistinctData from PivotItem to TableColumn', () => {
    const format = (_row: IItem, value?: any) => `formatted:${value}`
    const getDistinctData = () => [{ id: 'a', label: 'A' }]

    const item = new PivotItem({
      field: 'region',
      dataType: 'string',
      format,
      getDistinctData,
      usage: {
        filter: [{ index: 0, comparator: ComparatorEnum.EQUAL as never, filterValue: 'a' }],
      },
    })

    const column = pivotItemToTableColumn(item)

    expect(column.format).toBe(format)
    expect(column.getDistinctData).toBe(getDistinctData)
    expect(column.filters[0]?.format).toBe(format)
  })

  it('forwards comparator and comparators from PivotItem to TableColumn', () => {
    const item = new PivotItem({
      field: 'region',
      dataType: 'string',
      comparator: ComparatorEnum.IN as never,
      comparators: [ComparatorEnum.IN as never, ComparatorEnum.NOT_IN as never],
    })

    const column = pivotItemToTableColumn(item)

    expect(column.comparator).toBe(ComparatorEnum.IN)
    expect(column.comparators).toEqual([ComparatorEnum.IN, ComparatorEnum.NOT_IN])
  })

  it('preserves callbacks through PivotItem construction', () => {
    const format = (_row: IItem, value?: any) => value
    const getDistinctData = async () => [{ id: 1, label: 'One' }]

    const item = new PivotItem({
      field: 'status',
      format,
      getDistinctData,
      comparator: ComparatorEnum.EQUAL as never,
      comparators: [ComparatorEnum.EQUAL as never],
    })

    expect(item.format).toBe(format)
    expect(item.getDistinctData).toBe(getDistinctData)
    expect(item.comparator).toBe(ComparatorEnum.EQUAL)
    expect(item.comparators).toEqual([ComparatorEnum.EQUAL])
  })

  it('marks generated column group headers with columnFieldIndex', () => {
    const data = [
      { region: 'EU', month: '2026-01', revenue: 10 },
      { region: 'US', month: '2026-01', revenue: 20 },
    ]

    const result = buildPivotValueColumns({
      data,
      columnFields: [
        { field: 'region', dataType: 'string' },
        { field: 'month', dataType: 'string' },
      ],
      valueFields: [{
        measureId: 'revenue-sum',
        field: 'revenue',
        summaryType: summary.SUM,
        widthResolved: '100px',
        _label: 'Revenue',
      }],
    })

    const groupHeaders = result.valueHeaderRows
      .flat()
      .filter(cell => cell.columnFieldIndex !== undefined)

    expect(groupHeaders.length).toBeGreaterThan(0)
    expect(groupHeaders.every(cell => (
      cell.columnFieldIndex === 0 || cell.columnFieldIndex === 1
    ))).toBe(true)
    expect(groupHeaders.some(cell => cell.columnFieldIndex === 0)).toBe(true)
    expect(groupHeaders.some(cell => cell.columnFieldIndex === 1)).toBe(true)
  })
})

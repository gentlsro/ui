import { describe, expect, it, vi } from 'vitest'
import type { IPivotCurrentViewExport } from '../types/pivot-export.type'
import { buildPivotCurrentViewSheet, exportPivotData } from './pivot-export-data'

const exportMocks = vi.hoisted(() => ({
  csv: vi.fn(),
  json: vi.fn(),
  xlsx: vi.fn(),
}))

vi.mock('../../Table/functions/table-export-csv', () => ({
  tableExportCsv: exportMocks.csv,
}))

vi.mock('../../Table/functions/table-export-json', () => ({
  tableExportJson: exportMocks.json,
}))

vi.mock('../../Table/functions/table-export-xlsx', () => ({
  tableExportXlsx: exportMocks.xlsx,
}))

const currentView: IPivotCurrentViewExport = {
  rowHeaders: [
    { field: 'center', label: 'Center' },
    { field: 'car', label: 'Car' },
  ],
  valueHeaders: [
    [
      { label: '2026', colspan: 2, rowspan: 1, level: 0 },
      { label: 'Grand Total', colspan: 1, rowspan: 2, level: 0 },
    ],
    [
      { label: 'Revenue', colspan: 1, rowspan: 1, level: 1 },
      { label: 'Cost', colspan: 1, rowspan: 1, level: 1 },
    ],
  ],
  columns: [
    {
      label: '2026 / Revenue',
      columnPath: ['2026'],
      measureId: 'revenue-sum',
      valueField: 'revenue',
      isGrandTotal: false,
      isCollapsedGroupColumn: false,
    },
    {
      label: '2026 / Cost',
      columnPath: ['2026'],
      measureId: 'cost-sum',
      valueField: 'cost',
      isGrandTotal: false,
      isCollapsedGroupColumn: false,
    },
    {
      label: 'Grand Total',
      columnPath: ['__grand_total__'],
      measureId: 'revenue-sum',
      valueField: 'revenue',
      isGrandTotal: true,
      isCollapsedGroupColumn: false,
    },
  ],
  rows: [{
    kind: 'data',
    rowHeaders: ['North', 'Truck'],
    values: [100, 40, 100],
  }],
}

describe('buildPivotCurrentViewSheet', () => {
  it('places hierarchical headers and preserves typed aggregate values', async () => {
    const sheet = await buildPivotCurrentViewSheet(currentView)

    expect(sheet.A1?.v).toBe('Center')
    expect(sheet.C1?.v).toBe('2026')
    expect(sheet.C2?.v).toBe('Revenue')
    expect(sheet.C3?.v).toBe(100)
    expect(sheet.C3?.t).toBe('n')
    expect(sheet['!merges']).toEqual([
      { s: { r: 0, c: 0 }, e: { r: 1, c: 0 } },
      { s: { r: 0, c: 1 }, e: { r: 1, c: 1 } },
      { s: { r: 0, c: 2 }, e: { r: 0, c: 3 } },
      { s: { r: 0, c: 4 }, e: { r: 1, c: 4 } },
    ])
  })
})

describe('exportPivotData', () => {
  it('passes raw source rows through unchanged', () => {
    const rows = [{ id: 1, occurredAt: new Date('2026-08-11T12:00:00Z') }]

    exportPivotData({
      fileName: 'raw-pivot',
      format: 'json',
      raw: true,
      rawData: rows,
    })

    expect(exportMocks.json).toHaveBeenCalledWith({
      fileName: 'raw-pivot',
      data: rows,
    })
    expect(exportMocks.json.mock.calls[0]![0].data).toBe(rows)
  })

  it('requires materialized data for a current-view export', () => {
    expect(() => exportPivotData({
      fileName: 'current-pivot',
      format: 'xlsx',
      raw: false,
      rawData: [],
    })).toThrow('Current Pivot view is required')
  })
})

import { describe, expect, it } from 'vitest'
import type { IPivotDataItem } from '../types/pivot-data-item.type'
import type { IPivotValueColumnItem } from '../types/pivot-value-column-item.type'
import type { PivotItem } from '../models/pivot-item.model'
import { buildPivotCurrentViewExport } from './pivot-build-current-view-export'
import { createPivotValueLayout } from './pivot-resolve-value-item'

type SourceRow = {
  center: string
  revenue: number
}

const rowField = {
  field: 'center',
  _label: 'Center',
  dataType: 'string',
} as PivotItem<SourceRow>

const valueField = {
  field: 'revenue',
  _label: 'Revenue',
} as PivotItem<SourceRow>

const valueColumn = {
  id: 'revenue',
  columnPath: [],
  measureId: 'revenue-sum',
  valueField: 'revenue',
  value: valueField,
  label: 'Revenue',
  width: '80px',
} as IPivotValueColumnItem<SourceRow>

// Row values are aligned with `valueColumn`; the collapsed `2026` column group has one aggregate
const valueLayout = createPivotValueLayout<SourceRow>({
  valueColumns: [valueColumn],
  columnGroupKeys: ['2026:revenue-sum'],
  valueFields: [],
})

function createVisibleRow(): IPivotDataItem<SourceRow> {
  const ref = { center: 'North', revenue: 10 }

  return {
    id: 'north',
    label: 'North',
    groupPath: ['North'],
    groupIds: ['north-group'],
    rowItem: {
      id: 'north-row',
      kind: 'data',
      label: 'North',
      cells: [{
        id: 'north-cell',
        kind: 'rowLabel',
        rowFieldIndex: 0,
        row: rowField,
        groupId: 'north-group',
        ref,
      }],
    },
    valueItem: {
      id: 'north-values',
      kind: 'data',
      groupIds: ['north-group'],
      values: new Float64Array([10]),
      hasValues: new Uint8Array([1]),
      columnGroupValues: new Float64Array([45]),
      columnGroupHasValues: new Uint8Array([1]),
    },
  }
}

describe('buildPivotCurrentViewExport', () => {
  it('exports only supplied visible rows with their values', () => {
    const result = buildPivotCurrentViewExport({
      displayRowFields: [rowField],
      rows: [rowField],
      visibleData: [createVisibleRow()],
      visibleValueColumns: [valueColumn],
      visibleValueHeaderRows: [[{
        id: 'revenue-header',
        label: 'Revenue',
        colspan: 1,
        rowspan: 1,
        level: 0,
      }]],
      valueLayout,
      promotedRowLabelLevelsById: new Map(),
      collapsedGroupIds: new Set(),
      localeIso: 'en-US',
      formatCellValue: ({ value }) => value,
    })

    expect(result.rowHeaders).toEqual([{ field: 'center', label: 'Center' }])
    expect(result.rows).toEqual([{
      kind: 'data',
      rowHeaders: ['North'],
      values: [10],
    }])
  })

  it('keeps empty spacer rows and serializes missing aggregates as null', () => {
    const row = createVisibleRow()
    row.rowItem.kind = 'emptyRow'
    row.rowItem.cells[0]!.kind = 'empty'
    // Spacer rows carry no values
    row.valueItem = { id: 'empty-values', kind: 'emptyRow', groupIds: [] }

    const result = buildPivotCurrentViewExport({
      displayRowFields: [rowField],
      rows: [rowField],
      visibleData: [row],
      visibleValueColumns: [valueColumn],
      visibleValueHeaderRows: [],
      valueLayout,
      promotedRowLabelLevelsById: new Map(),
      collapsedGroupIds: new Set(),
      localeIso: 'en-US',
      formatCellValue: ({ value }) => value,
    })

    expect(result.rows[0]).toEqual({
      kind: 'emptyRow',
      rowHeaders: [''],
      values: [null],
    })
  })

  it('exports the aggregate represented by a collapsed column group', () => {
    const row = createVisibleRow()

    const collapsedColumn = {
      ...valueColumn,
      id: 'collapsed:2026:revenue-sum',
      columnPath: ['2026'],
      label: '2026 / Revenue',
      isCollapsedGroupColumn: true,
    }
    const result = buildPivotCurrentViewExport({
      displayRowFields: [rowField],
      rows: [rowField],
      visibleData: [row],
      visibleValueColumns: [collapsedColumn],
      visibleValueHeaderRows: [],
      valueLayout,
      promotedRowLabelLevelsById: new Map(),
      collapsedGroupIds: new Set(),
      localeIso: 'en-US',
      formatCellValue: ({ value }) => value,
    })

    expect(result.rows[0]!.values).toEqual([45])
    expect(result.columns[0]!.isCollapsedGroupColumn).toBe(true)
  })
})

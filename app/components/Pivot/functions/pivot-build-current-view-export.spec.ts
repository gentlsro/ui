import { describe, expect, it } from 'vitest'
import type { IPivotDataItem } from '../types/pivot-data-item.type'
import type { IPivotValueColumnItem } from '../types/pivot-value-column-item.type'
import type { PivotItem } from '../models/pivot-item.model'
import { buildPivotCurrentViewExport } from './pivot-build-current-view-export'

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
      cells: [{
        id: 'north-revenue',
        kind: 'data',
        columnId: 'revenue',
        columnPath: [],
        measureId: 'revenue-sum',
        valueField: 'revenue',
        value: valueField,
        aggregated: 10,
        hasValue: true,
      }],
      collapsedGroupValueItems: {
        'north-group': {
          id: 'north-collapsed-values',
          kind: 'subtotal',
          groupIds: ['north-group'],
          cells: [{
            id: 'north-collapsed-revenue',
            kind: 'subtotal',
            columnId: 'revenue',
            columnPath: [],
            measureId: 'revenue-sum',
            valueField: 'revenue',
            value: valueField,
            aggregated: 30,
            hasValue: true,
          }],
        },
      },
    },
  }
}

describe('buildPivotCurrentViewExport', () => {
  it('exports only supplied visible rows and uses collapsed aggregates', () => {
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
      promotedRowLabelLevelsById: new Map(),
      collapsedGroupIds: new Set(['north-group']),
      localeIso: 'en-US',
      formatCellValue: ({ value }) => value,
    })

    expect(result.rowHeaders).toEqual([{ field: 'center', label: 'Center' }])
    expect(result.rows).toEqual([{
      kind: 'data',
      rowHeaders: ['North'],
      values: [30],
    }])
  })

  it('keeps empty spacer rows and serializes missing aggregates as null', () => {
    const row = createVisibleRow()
    row.rowItem.kind = 'emptyRow'
    row.rowItem.cells[0]!.kind = 'empty'
    row.valueItem.cells[0]!.hasValue = false
    row.valueItem.collapsedGroupValueItems = undefined

    const result = buildPivotCurrentViewExport({
      displayRowFields: [rowField],
      rows: [rowField],
      visibleData: [row],
      visibleValueColumns: [valueColumn],
      visibleValueHeaderRows: [],
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
    row.valueItem.collapsedGroupValueItems = undefined
    row.valueItem.columnGroupCells = {
      '2026:revenue-sum': {
        id: '2026-revenue',
        kind: 'data',
        columnId: '2026',
        columnPath: ['2026'],
        measureId: 'revenue-sum',
        valueField: 'revenue',
        value: valueField,
        aggregated: 45,
        hasValue: true,
      },
    }

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
      promotedRowLabelLevelsById: new Map(),
      collapsedGroupIds: new Set(),
      localeIso: 'en-US',
      formatCellValue: ({ value }) => value,
    })

    expect(result.rows[0]!.values).toEqual([45])
    expect(result.columns[0]!.isCollapsedGroupColumn).toBe(true)
  })
})

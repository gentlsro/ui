import type { IPivotCurrentViewExport } from '../types/pivot-export.type'
import type { IPivotDataItem } from '../types/pivot-data-item.type'
import type { IPivotValueColumnItem, IPivotValueHeaderCell } from '../types/pivot-value-column-item.type'
import type { PivotItem } from '../models/pivot-item.model'
import { resolvePivotRowItemCell } from './pivot-resolve-row-item-cell'
import { resolvePivotDisplayedValueCells } from './pivot-resolve-value-item'
import type { IPivotValueLayout } from './pivot-resolve-value-item'
import type { IPivotLabels } from '../constants/pivot-labels.constant'

export function buildPivotCurrentViewExport<T extends IItem>(payload: {
  displayRowFields: PivotItem<T>[]
  rows: PivotItem<T>[]
  visibleData: IPivotDataItem<T>[]
  visibleValueColumns: IPivotValueColumnItem<T>[]
  visibleValueHeaderRows: IPivotValueHeaderCell[][]
  valueLayout: IPivotValueLayout<T>
  promotedRowLabelLevelsById: Map<string, number[]>
  collapsedGroupIds: Set<string>
  localeIso: string
  formatCellValue: Parameters<typeof resolvePivotRowItemCell<T>>[0]['formatCellValue']
  labels?: IPivotLabels
}): IPivotCurrentViewExport {
  const {
    displayRowFields,
    rows,
    visibleData,
    visibleValueColumns,
    visibleValueHeaderRows,
    valueLayout,
    promotedRowLabelLevelsById,
    collapsedGroupIds,
    localeIso,
    formatCellValue,
    labels,
  } = payload

  return {
    rowHeaders: displayRowFields.map(row => ({
      field: String(row.field),
      label: row._label,
    })),
    valueHeaders: visibleValueHeaderRows.map(headerRow => headerRow.map(cell => ({
      label: cell.label,
      colspan: cell.colspan,
      rowspan: cell.rowspan,
      level: cell.level,
    }))),
    columns: visibleValueColumns.map(column => ({
      label: column.label,
      columnPath: column.columnPath,
      measureId: column.measureId,
      valueField: String(column.valueField),
      isGrandTotal: !!column.isGrandTotal,
      isCollapsedGroupColumn: !!column.isCollapsedGroupColumn,
    })),
    rows: visibleData.map(row => {
      const promotedLevels = promotedRowLabelLevelsById.get(row.id) ?? []
      const rowHeaders = row.rowItem.cells.map(cell => {
        const resolved = resolvePivotRowItemCell({
          item: cell,
          groupIds: row.groupIds,
          groupPath: row.groupPath,
          promotedLevels,
          rows,
          collapsedGroupIds,
          localeIso,
          formatCellValue,
          labels,
        })

        return resolved.showContent ? resolved.displayValue : ''
      })
      const values = resolvePivotDisplayedValueCells({
        row,
        columns: visibleValueColumns,
        layout: valueLayout,
      }).map(cell => {
        return cell.hasValue && Number.isFinite(cell.aggregated)
          ? cell.aggregated
          : null
      })

      return {
        kind: row.rowItem.kind ?? 'data',
        rowHeaders,
        values,
      }
    }),
  }
}

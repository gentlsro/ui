import type { TableColumn } from '../models/table-column.model'
import { klona } from 'klona/full'
import { get, set, toPath } from 'lodash-es'
import { computed, shallowRef } from 'vue'
import { tableIsCellEditable } from '../functions/table-is-cell-editable'

export interface TableCellEdit { row: IItem, column: TableColumn, value: unknown }

export function useTableCellEditing() {
  const cellEdit = shallowRef<TableCellEdit[]>([])
  const cellEditMode = shallowRef<'cell' | 'row'>('cell')

  const {
    model: cellEditValue,
    isModified: isCellEditModified,
    reset: resetCellEditValue,
    syncFromOrigin: loadCellEditValue,
  } = useRefReset<unknown[]>(
    () => cellEdit.value.map(({ row, column }) => get(row, column.field)),
    { autoSyncFromOrigin: false },
  )

  const isEditingCell = computed(() => cellEdit.value.length > 0)

  function startCellEdit(row: IItem, columns: TableColumn | TableColumn[], mode: 'cell' | 'row' = 'cell') {
    cellEditMode.value = mode
    const fields = new Set<string>()

    cellEdit.value = (Array.isArray(columns) ? columns : [columns])
      .filter(column => {
        if (!tableIsCellEditable(row, column) || fields.has(column.field)) {
          return false
        }
        fields.add(column.field)
        return true
      })
      .map((column, index) => ({
        row,
        column,
        get value() {
          return cellEditValue.value[index]
        },
        set value(value: TableCellEdit['value']) {
          cellEditValue.value[index] = value
        },
      }))

    loadCellEditValue()
  }

  function saveCellEditValue() {
    const row = cellEdit.value[0]?.row

    if (!row) {
      return
    }

    const edits = cellEdit.value
    const originalRow = klona(row)
    const draft = klona(row)
    const result: IItem = {}

    for (const edit of edits) {
      set(draft, edit.column.field, klona(edit.value))
      if (!edit.column.editComponent?.onSave) {
        const root = toPath(edit.column.field)[0]

        if (root !== undefined && !Object.hasOwn(result, root)) {
          result[root] = klona(row[root])
        }

        set(result, edit.column.field, klona(edit.value))
      }
    }

    for (const { column } of edits) {
      const onSave = column.editComponent?.onSave
      
      if (onSave) {
        const saved = onSave(klona(draft), column, klona(originalRow))
        Object.assign(draft, saved)
        Object.assign(result, saved)
      }
    }

    // Apply only after every callback succeeds.
    Object.assign(row, result)

    loadCellEditValue()
  }

  function cancelCellEdit() {
    cellEdit.value = []
    cellEditMode.value = 'cell'
    loadCellEditValue()
  }

  return {
    cellEdit,
    cellEditMode,
    cellEditValue,
    isEditingCell,
    isCellEditModified,
    startCellEdit,
    loadCellEditValue,
    resetCellEditValue,
    saveCellEditValue,
    cancelCellEdit,
  }
}

import type { TableColumn } from '../models/table-column.model'

// Utils
import { klona } from 'klona/full'
import { get, set, toPath } from 'lodash-es'

// Functions
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

  function getCellEdit(row: IItem, field: string) {
    return cellEdit.value.find(edit => edit.row === row && edit.column.field === field)
  }

  function updateCellEditValue(row: IItem, field: string, value: TableCellEdit['value']) {
    const edit = getCellEdit(row, field)

    if (edit) {
      edit.value = value
    }
  }

  function isEditingRow(row: IItem) {
    return cellEdit.value.some(edit => edit.row === row)
  }

  function startRowEdit(row: IItem, columns: TableColumn[]) {
    return startCellEdit(row, columns, 'row')
  }

  function startCellEdit(row: IItem, columns: TableColumn | TableColumn[], mode: 'cell' | 'row' = 'cell') {
    // A full-row draft must be saved or cancelled before another edit can start.
    if (cellEdit.value.length && (cellEditMode.value === 'row' || mode === 'row')) {
      return false
    }

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

    return cellEdit.value.length > 0
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

  function finishCellEdit() {
    saveCellEditValue()
    cancelCellEdit()
  }

  return {
    cellEdit,
    cellEditMode,
    cellEditValue,
    isEditingCell,
    isCellEditModified,
    getCellEdit,
    updateCellEditValue,
    isEditingRow,
    startRowEdit,
    finishCellEdit,
    startCellEdit,
    loadCellEditValue,
    resetCellEditValue,
    saveCellEditValue,
    cancelCellEdit,
  }
}

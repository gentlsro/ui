// Utils
import { klona } from 'klona/full'

// Types
import type { ITableRowEdit } from '../types/table-row-edit.type'

// Models
import type { TableColumn } from '../models/table-column.model'

// Functions
import { tableIsCellEditable } from '../functions/table-is-cell-editable'

export type TableCellEdit = {
  row: IItem
  column: TableColumn
  value: unknown
}

export function useTableCellEditing(rowEdit: Ref<ITableRowEdit | undefined>) {
  // Editing state
  const cellEdit = shallowRef<TableCellEdit[]>([])
  const cellEditMode = shallowRef<'cell' | 'row'>('cell')
  const editingRow = shallowRef<IItem>()
  const rowOriginal = shallowRef<IItem>()
  const isSavingRow = ref(false)
  const rowSaveError = ref<string>()

  // Draft values
  const {
    model: cellEditValue,
    isModified: isCellEditModified,
    reset: resetCellEditValue,
    syncFromOrigin: loadCellEditValue,
  } = useRefReset<unknown[]>(
    () => cellEdit.value.map(({ row, column }) => get(row, column.field)),
    { autoSyncFromOrigin: false },
  )

  const isEditingCell = computed(() => !!editingRow.value || cellEdit.value.length > 0)

  function getCellEdit(row: IItem, field: string) {
    return cellEdit.value.find(edit => edit.row === row && edit.column.field === field)
  }

  function updateCellEditValue(
    row: IItem,
    field: string,
    value: TableCellEdit['value'],
  ) {
    const edit = getCellEdit(row, field)

    if (edit && !isSavingRow.value) {
      rowSaveError.value = undefined
      edit.value = value
    }
  }

  // Starting an edit
  function isEditingRow(row: IItem) {
    return editingRow.value === row || cellEdit.value.some(edit => edit.row === row)
  }

  function startRowEdit(row: IItem, columns: TableColumn[]) {
    return startCellEdit(row, columns, 'row')
  }

  function startCellEdit(
    row: IItem,
    columns: TableColumn | TableColumn[],
    mode: 'cell' | 'row' = 'cell',
  ) {
    // A full-row draft must be saved or cancelled before another edit can start.
    const hasRowEdit = isEditingCell.value
      && (cellEditMode.value === 'row' || mode === 'row')

    if (isSavingRow.value || hasRowEdit) {
      return false
    }

    cellEditMode.value = mode
    editingRow.value = mode === 'row' ? row : undefined
    rowOriginal.value = mode === 'row' ? klona(row) : undefined
    rowSaveError.value = undefined
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

    return mode === 'row' || cellEdit.value.length > 0
  }

  // Cell saves
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

  // Cleanup and cancellation
  function clearEdit() {
    cellEdit.value = []
    cellEditMode.value = 'cell'
    editingRow.value = undefined
    rowOriginal.value = undefined
    rowSaveError.value = undefined
    loadCellEditValue()
  }

  function cancelCellEdit() {
    if (isSavingRow.value) {
      return
    }

    const row = editingRow.value
    clearEdit()

    if (row) {
      rowEdit.value?.onCancel?.(row)
    }
  }

  // Row saves
  async function finishRowEdit() {
    const row = editingRow.value
    const config = rowEdit.value

    if (!row || !config || isSavingRow.value) {
      return
    }

    const originalRow = klona(rowOriginal.value ?? row)
    const draft = klona(originalRow)
    const changedFields: string[] = []

    for (const edit of cellEdit.value) {
      set(draft, edit.column.field, klona(edit.value))

      if (!isEqual(edit.value, get(originalRow, edit.column.field))) {
        changedFields.push(edit.column.field)
      }
    }

    isSavingRow.value = true
    rowSaveError.value = undefined

    try {
      const saved = await config.onSave({ row: draft, originalRow, changedFields })
      Object.assign(row, saved)
      clearEdit()
      config.onSaved?.(row)
    } catch (error) {
      rowSaveError.value = error instanceof Error ? error.message : String(error)
    } finally {
      isSavingRow.value = false
    }
  }

  // Finishing an edit
  function finishCellEdit() {
    if (cellEditMode.value === 'row' && rowEdit.value) {
      return finishRowEdit()
    }

    saveCellEditValue()
    cancelCellEdit()
  }

  return {
    cellEdit,
    cellEditMode,
    editingRow,
    isSavingRow,
    rowSaveError,
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

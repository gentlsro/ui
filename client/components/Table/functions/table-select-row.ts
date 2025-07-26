// Types
import type { ITableProps } from '../types/table-props.type'

// Functions
import { getListItemKey } from '../../List/functions/helpers'

export async function tableSelectRow(payload: {
  selection: Ref<ITableProps['selection']>
  selectionConfig: ITableProps['selectionConfig']
  row: IItem
  rowKey: string
  selectionByKey: Record<string, boolean>

  /**
   * When true, only given row will be selected, others will be deselected
   */
  isSet?: boolean

  /**
   * When true, the result of `onSelect` will be ignored.
   * By default, if `onSelect` returns `false`, the selection event will be cancelled.
   */
  isForced?: boolean
}) {
  const {
    selection,
    selectionByKey,
    selectionConfig,
    row,
    rowKey,
    isSet,
    isForced,
  } = payload

  if (!selectionConfig?.enabled) {
    return
  }

  if (selectionConfig.onSelect) {
    const shouldContinue = await selectionConfig.onSelect({ row, selection, isSet, isForced })

    if (shouldContinue === false && !isForced) {
      return
    }
  }

  const key = selectionConfig.selectionKey ?? rowKey
  const itemKey = getListItemKey(row, key)

  const isMulti = selectionConfig.multi
  const isSelected = selectionByKey[itemKey]

  if (isSet) {
    const value = selectionConfig.emitKey ? itemKey : row
    selection.value = isMulti ? [value] : value

    return
  }

  const model = Array.isArray(selection.value)
    ? selection.value
    : selection.value ? [selection.value] : []

  // Unselect
  if (isSelected) {
    if (isMulti) {
      selection.value = model.filter(s => getListItemKey(s, key) !== itemKey)
    } else {
      selection.value = undefined
    }
  }

  // Select
  else {
    if (isMulti) {
      selection.value = [
        ...model,
        selectionConfig.emitKey ? itemKey : row,
      ]
    } else {
      selection.value = selectionConfig.emitKey ? itemKey : row
    }
  }
}

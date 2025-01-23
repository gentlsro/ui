// @unocss-include

// Types
import type { ITableProps } from '../types/table-props.type'

// Models
import { TableColumn } from '../models/table-column.model'
import type { GroupItem } from '$utils/shared/models/group-item.model'

type IPayload = {
  groups?: MaybeRefOrGetter<GroupItem[]>
  expandIconWidth?: number
  selectionConfig?: ITableProps['selectionConfig']
}

/**
 * Will add `helper` columns to the table
 *  - selection
 *  - group expansion
 */
export function extendColumns(columns: TableColumn<any>[], payload?: IPayload) {
  const {
    groups = [],
    selectionConfig,
    expandIconWidth = 28,
  } = payload || {}

  const _groups = toValue(groups)
  const _groupExpandWidth = expandIconWidth || 28
  const isSelectable = !!selectionConfig?.enabled

  // We create a copy of the columns but we keep the reference to the original
  // column objects so we can mutate them
  const _columns = [...columns]

  // Groups
  _columns.unshift(
    ..._groups.map(
      (group, idx) =>
        new TableColumn({
          field: `_group_${group.name}`,
          width: `${idx ? _groupExpandWidth / 1.5 : _groupExpandWidth}px`,
          hideLabel: true,
          isHelperCol: true,
        }),
    ),
  )

  // Selection
  if (isSelectable) {
    _columns.unshift(
      new TableColumn({
        field: '_selectable',
        width: '36px',
        hideLabel: true,
        isHelperCol: true,
        cellClass: 'flex flex-center !p-x-0',
        headerClass: 'flex flex-center !p-x-0 !gap-0',
      }),
    )
  }

  return _columns
}

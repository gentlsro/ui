// Types
import type { IListItem } from '../../types/list-item.type'
import type { IListProps } from '../../types/list-props.type'
import { getListItemKey } from './get-list-item-key'

export function isListItemSelected(payload: {
  item: IListItem
  selection: IListProps['selection']
  itemKey: IListProps['itemKey']
}) {
  const { item, selection, itemKey = 'id' } = payload

  if (!selection) {
    return false
  }

  const arraySelected = Array.isArray(selection)
    ? selection
    : [selection]

  const idsSelected = arraySelected
    .map(s => typeof s === 'object' ? getListItemKey(s, itemKey) : s)
    .filter(Boolean) as (string | number)[]

  return idsSelected.includes(item.id)
}

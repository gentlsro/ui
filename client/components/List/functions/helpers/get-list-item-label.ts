// Types
import type { IListProps } from '../../types/list-props.type'
import { getListItem } from './get-list-item'

export function getListItemLabel(
  item: any,
  itemLabel: IListProps['itemLabel'],
  itemByKey: IItem = {},
) {
  if (typeof itemLabel === 'function') {
    const _item = getListItem(item, itemByKey)

    return itemLabel(_item)
  }

  return typeof item === 'object'
    ? get(item, itemLabel ?? 'label')
    : get(itemByKey, item)?.[itemLabel ?? ''] ?? item
}

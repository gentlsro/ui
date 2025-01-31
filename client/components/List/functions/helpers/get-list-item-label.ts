// Types
import type { IListProps } from '../../types/list-props.type'

export function getListItemLabel(
  item: any,
  itemLabel: IListProps['itemLabel'],
  itemByKey: IItem = {},
) {
  if (typeof itemLabel === 'function') {
    return itemLabel(item)
  }

  return typeof item === 'object'
    ? get(item, itemLabel ?? 'label')
    : get(itemByKey, item)?.[itemLabel ?? ''] ?? item
}

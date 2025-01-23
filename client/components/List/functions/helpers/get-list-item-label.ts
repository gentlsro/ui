// Types
import type { IListProps } from '../../types/list-props.type'

export function getListItemLabel(
  item: any,
  itemLabel: IListProps['itemLabel'],
) {
  if (typeof itemLabel === 'function') {
    return itemLabel(item)
  }

  return typeof item === 'object' ? get(item, itemLabel ?? 'label') : item
}

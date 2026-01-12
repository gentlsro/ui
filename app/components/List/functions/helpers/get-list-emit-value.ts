import { getListItem } from './get-list-item'
import { getListItemKey } from './get-list-item-key'

export function getListItemEmitValue(
  item: IItem,
  dependencies: {
    emitKey: boolean
    itemKey: string
    itemByKey: Record<string, IItem>
  },
) {
  const { emitKey, itemKey, itemByKey } = dependencies

  return emitKey ? getListItemKey(item, itemKey) : getListItem(item, itemByKey)
}

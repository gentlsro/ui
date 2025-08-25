import { klona } from 'klona/full'

// Types
import type { IListEmitFncs } from '../types/list-emit-fncs.type'
import type { IListProps } from '../types/list-props.type'
import type { IListItemToAdd } from '../types/list-item-to-add.type'

// Components
import type { IListItem } from '../types/list-item.type'

export function listHandleAdd(payload: {
  isMulti?: boolean
  item: IListItemToAdd | IListItem
  addConfig: IListProps['addConfig']
  addedItems: Ref<IListItemToAdd[]>
  isSelected: boolean
  emits: IListEmitFncs
  isAddedItem?: boolean
}) {
  const {
    isMulti,
    item,
    addConfig,
    isSelected,
    emits,
    addedItems,
    isAddedItem,
  } = payload
  const { noLocalAdd, keepAddedItems, transformAddedItem } = addConfig ?? {}

  // Transform the item
  const _item = (klona(item)) as IListItemToAdd
  _item.ref = isSelected
    ? _item.ref
    : transformAddedItem?.(_item.ref) ?? _item.ref

  _item._isNew = true

  // Multi
  if (isMulti) {
    // Remove
    if (isSelected) {
      emits.remove(_item)

      if (keepAddedItems) {
        return
      }

      addedItems.value = addedItems.value.filter(i => i.id !== _item.id)
    }

    // Add
    else if (!isAddedItem) {
      emits.add(_item)

      if (noLocalAdd) {
        return _item
      }

      addedItems.value = [...addedItems.value, _item]
    }
  }

  // Single
  else {
    // Remove
    if (isSelected) {
      emits.remove(_item)

      if (keepAddedItems) {
        return
      }

      addedItems.value = []
    }

    // Add
    else if (!isAddedItem) {
      emits.add(_item)

      if (noLocalAdd) {
        return _item
      }

      addedItems.value = [_item]
    }
  }
}

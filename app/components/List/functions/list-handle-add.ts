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
  itemKey?: string
}) {
  const {
    isMulti,
    item,
    addConfig,
    isSelected,
    emits,
    addedItems,
    isAddedItem,
    itemKey = 'id',
  } = payload
  const { noLocalAdd, keepAddedItems, transformAddedItem } = addConfig ?? {}

  function handleTransformFnc(fnc: (payload: { item: IListItemToAdd }) => IListItemToAdd) {
    return fnc({ item: _item })
  }

  // Transform the item
  item.ref = isSelected
    ? item.ref
    : transformAddedItem?.(item.ref, handleTransformFnc) ?? item.ref

  if (item.ref[itemKey] !== item.id) {
    item.id = item.ref[itemKey]
  }

  // Clone the item
  const _item = (klona(item)) as IListItemToAdd
  _item._isCreate = true
  _item._isNew = false

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
        return
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
        return
      }

      addedItems.value = [_item]
    }
  }
}

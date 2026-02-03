import type { IListItem } from '../types/list-item.type'
import type { IListEmitFncs } from '../types/list-emit-fncs.type'
import type { IListProps } from '../types/list-props.type'
import type { IListItemToAdd } from '../types/list-item-to-add.type'

// Functions
import { listHandleAdd } from './list-handle-add'
import { getListItemEmitValue, getListItemKey } from './helpers'

// Components
import type SearchInput from '../../Inputs/TextInput/SearchInput.vue'

export async function listItemSelect(payload: {
  selection: Ref<IListProps['selection']>
  item: IListItem | IListItemToAdd
  itemByKey: Record<string, IItem>
  selectionConfig: IListProps['selectionConfig']
  addConfig: IListProps['addConfig']
  isSelected: boolean
  itemKey?: string
  addedItems: Ref<IListItemToAdd[]>
  emits: IListEmitFncs
  searchInput: InstanceType<typeof SearchInput> | undefined
  isAddedItem?: boolean
  clearable?: boolean
  shouldFocusSearch?: boolean
  validation: IValidation
}) {
  const {
    selection,
    item,
    itemByKey,
    selectionConfig,
    isSelected,
    addConfig,
    itemKey = 'id',
    addedItems,
    emits,
    searchInput,
    isAddedItem,
    clearable,
    shouldFocusSearch,
    validation,
  } = payload

  // This is a helper to determine whether the `listHandleAdd` function has been called
  let isAddCalled = false

  const isEmitKey = !!selectionConfig?.emitKey
  const isMulti = selectionConfig?.multi
  const isClearable = isNil(clearable) ? true : clearable

  const model = Array.isArray(selection.value)
    ? selection.value
    : selection.value ? [selection.value] : []

  // Unselect
  if (isSelected) {
    emits.unselect(item)

    if (isMulti) {
      selection.value = model.filter(s => getListItemKey(s, itemKey) !== item.id)
    }

    // When the single selection is clearable, we just remove it
    else if (isClearable) {
      selection.value = undefined
    }

    // When the single selection is not clearable, we want to trigger the `selection`
    // event to potentially hide `Menu` or similar
    else {
      emits.select(item)
    }
  }

  // Select
  else {
    if ('_isNew' in item) {
      const { isValid } = validation.validate()

      if (!isValid) {
        return
      }

      isAddCalled = true
      listHandleAdd({
        isMulti,
        isSelected,
        addedItems,
        addConfig,
        item,
        emits,
        isAddedItem,
        itemKey,
      })
    }

    emits.select(item)

    if (isMulti) {
      selection.value = [
        ...model,
        getListItemEmitValue(item.ref, {
          emitKey: isEmitKey,
          itemKey,
          itemByKey,
        }),
      ]
    } else {
      selection.value = getListItemEmitValue(item.ref, {
        emitKey: isEmitKey,
        itemKey,
        itemByKey,
      })
    }
  }

  validation.reset()

  if (!isAddCalled && ('_isNew' in item || isAddedItem)) {
    listHandleAdd({
      isMulti,
      isSelected,
      addedItems,
      addConfig,
      item,
      emits,
      isAddedItem,
      itemKey,
    })

    nextTick(() => searchInput?.clear(true))

    return
  }

  if (shouldFocusSearch) {
    searchInput?.select()
  }
}

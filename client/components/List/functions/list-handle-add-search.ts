// Types
import type { IListProps } from '../types/list-props.type'
import type { IListItemToAdd } from '../types/list-item-to-add.type'

export async function listHandleAddSearch(payload: {
  hasExactMatch: boolean
  itemLabel: IListProps['itemLabel']
  preAddedItem: Ref<IListItemToAdd | undefined>
  search?: string
  addConfig: IListProps['addConfig']
  $z: ReturnType<typeof useZod>
}) {
  const {
    search,
    addConfig,
    hasExactMatch,
    preAddedItem,
    itemLabel = 'label',
    $z,
  } = payload

  if (!addConfig?.enabled) {
    return
  }

  if (!search) {
    $z.value.$reset()
  }

  if (hasExactMatch || !search) {
    preAddedItem.value = undefined

    return
  }

  const labelKey = typeof itemLabel === 'function' ? 'label' : itemLabel

  const id = generateUUID().split('-')[0] as string

  if (preAddedItem.value) {
    preAddedItem.value.label = search
    preAddedItem.value._highlighted = search
    preAddedItem.value.ref[labelKey] = search
  } else {
    preAddedItem.value = {
      _isNew: true,
      id,
      label: search,
      path: '-1',
      index: -1,
      _highlighted: search,
      ref: { id, [labelKey]: search },
    }
  }
}

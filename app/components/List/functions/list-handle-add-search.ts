// Types
import type { IListProps } from '../types/list-props.type'
import type { IListItemToAdd } from '../types/list-item-to-add.type'

export async function listHandleAddSearch(payload: {
  hasExactMatch: boolean
  itemLabel: IListProps['itemLabel']
  preAddedItem: Ref<IListItemToAdd | undefined>
  search?: string
  addConfig: IListProps['addConfig']
  validation: IValidation
}) {
  const {
    search,
    addConfig,
    hasExactMatch,
    preAddedItem,
    itemLabel = 'label',
    validation,
  } = payload

  if (!addConfig?.enabled) {
    return
  }

  if (!search) {
    validation.reset()
  }

  // A list that validates what is added offers only what would pass (an ArkType type returns its errors, which carry
  // a `summary`, for a value that does not fit)
  const schema = addConfig.validationSchema as ((value: unknown) => unknown) | undefined
  const result = schema && search ? schema(search) : undefined
  const isInvalid = !!result && typeof result === 'object' && 'summary' in result

  if (hasExactMatch || !search || isInvalid) {
    preAddedItem.value = undefined

    return
  }

  const labelKey = typeof itemLabel === 'function' ? 'label' : itemLabel

  const id = preAddedItem.value?.id ?? generateUUID().split('-')[0] as string

  if (preAddedItem.value) {
    preAddedItem.value.label = search
    preAddedItem.value._highlighted = search
    preAddedItem.value.ref = {
      [labelKey]: search,
      id,
    }
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

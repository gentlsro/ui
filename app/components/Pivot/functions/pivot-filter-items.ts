// Constants
import { NON_VALUE_COMPARATORS } from '#layers/utilities/shared/constants/comparators-by-category.const'

// Models
import type { PivotItem } from '../models/pivot-item.model'

export type IPivotFilterSlot<T extends IItem = IItem> = NonNullable<PivotItem<T>['usage']['filter']>[number]

export function getPivotItemFilterSlots<T extends IItem>(item: PivotItem<T>) {
  return (item.usage.filter ?? []).filter(slot => slot.comparator !== undefined)
}

export function isPivotFilterSlotActive(slot: IPivotFilterSlot) {
  if (!slot.comparator) {
    return false
  }

  if (NON_VALUE_COMPARATORS.includes(slot.comparator)) {
    return true
  }

  if (Array.isArray(slot.filterValue)) {
    return slot.filterValue.length > 0
  }

  return !isNil(slot.filterValue)
}

export function hasPivotItemActiveFilters<T extends IItem>(item: PivotItem<T>) {
  return getPivotItemFilterSlots(item).some(isPivotFilterSlotActive)
}

export function getActivePivotFilterItems<T extends IItem>(items: PivotItem<T>[]) {
  const result: FilterItem<T>[] = []

  for (const item of items) {
    for (const slot of getPivotItemFilterSlots(item)) {
      if (!isPivotFilterSlotActive(slot)) {
        continue
      }

      result.push(new FilterItem<T>({
        field: item.field,
        dataType: item.dataType,
        comparator: slot.comparator,
        value: slot.filterValue,
      }))
    }
  }

  return result
}

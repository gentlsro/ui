import { ComparatorEnum } from '$comparatorEnum'

// Constants
import { NON_VALUE_COMPARATORS } from '#layers/utilities/shared/constants/comparators-by-category.const'
import { getDefaultComparatorByDataType } from '#layers/utilities/shared/constants/default-comparator-by-data-type.const'

// Models
import type { PivotItem } from '../models/pivot-item.model'
import { TableColumn } from '../../Table/models/table-column.model'

export type IPivotFilterSlot<T extends IItem = IItem> = NonNullable<PivotItem<T>['usage']['filter']>[number]

export function getPivotItemFilterSlots<T extends IItem>(item: PivotItem<T>) {
  return item.usage.filter ?? []
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

export function pivotFiltersToTableColumnFilters<T extends IItem>(item: PivotItem<T>) {
  return getPivotItemFilterSlots(item).map((slot, idx) => new FilterItem<T>({
    id: `${String(item.field)}-${slot.index}-${idx}`,
    field: item.field,
    dataType: item.dataType,
    comparator: slot.comparator,
    value: slot.filterValue,
  }))
}

export function tableColumnFiltersToPivotFilters<T extends IItem>(filters: FilterItem<T>[]) {
  return filters.map((filter, index) => ({
    index,
    comparator: filter.comparator,
    filterValue: filter.value,
  } satisfies IPivotFilterSlot))
}

export function syncTableColumnFiltersToPivotItem<T extends IItem>(
  item: PivotItem<T>,
  column: TableColumn<T>,
) {
  const filters = column.filters.filter(filter => {
    const isNonValueComparator = NON_VALUE_COMPARATORS.includes(filter.comparator)
    const isUndefinedValue = filter.value === undefined
    const isEmptyArray = Array.isArray(filter.value) && !filter.value.length

    return (
      (!isUndefinedValue && !isEmptyArray)
      || isNonValueComparator
    )
  })

  if (!filters.length) {
    item.usage.filter = []

    return
  }

  item.usage.filter = tableColumnFiltersToPivotFilters(filters)
}

export function pivotItemToTableColumn<T extends IItem>(item: PivotItem<T>) {
  return new TableColumn<T>({
    field: item.field as TableColumn<T>['field'],
    dataType: item.dataType,
    label: item._label,
    comparator: getDefaultComparatorByDataType(item.dataType),
    filters: pivotFiltersToTableColumnFilters(item),
  })
}

export function getNextPivotFilterComparator<T extends IItem>(
  column: TableColumn<T>,
  comparators: ComparatorEnum[],
) {
  const isDefaultComparatorUsed = column.filters.some(filter => {
    return filter.comparator === ComparatorEnum.EQUAL
  })

  const firstUnusedComparator = comparators.find(comparator => {
    return !column.filters.some(filter => filter.comparator === comparator)
  })

  if (isDefaultComparatorUsed) {
    return firstUnusedComparator ?? getDefaultComparatorByDataType(column.dataType)
  }

  return column.comparator
}

export function normalizePivotFilterSlotIndices<T extends IItem>(items: PivotItem<T>[]) {
  let globalIndex = 0

  for (const item of items) {
    if (!item.usage.filter?.length) {
      continue
    }

    item.usage.filter = item.usage.filter.map(slot => ({
      ...slot,
      index: globalIndex++,
    }))
  }
}

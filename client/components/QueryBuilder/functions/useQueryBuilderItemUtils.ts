import { ComparatorEnum } from '$comparatorEnum'

// Types
import type { ITableFilterItem } from '../../Table/types/table-filter-item.type'

// Models
import type { TableColumn } from '../../Table/models/table-column.model'

// Constants
import { BOOLEANISH_COMPARATORS, NON_VALUE_COMPARATORS, SELECTOR_COMPARATORS } from '$utils/shared/constants/comparators-by-category.const'
import { getComparatorsByDataType } from '$utils/shared/constants/comparators-by-datatype.const'

export function useQueryBuilderItemUtils(item: Ref<ITableFilterItem>) {
  function checkIsBooleanishComparator(comparator: ComparatorEnum) {
    return BOOLEANISH_COMPARATORS.includes(comparator)
  }

  function checkIsNonValueComparator(comparator: ComparatorEnum) {
    return NON_VALUE_COMPARATORS.includes(comparator)
  }

  function checkIsSelectorComparator(comparator: ComparatorEnum) {
    return SELECTOR_COMPARATORS.includes(comparator)
  }

  function canUseSelectorComparator(comparator: ComparatorEnum, column: TableColumn) {
    const comparators = column.getDistinctData
      ? [...SELECTOR_COMPARATORS, ComparatorEnum.EQUAL, ComparatorEnum.NOT_EQUAL]
      : SELECTOR_COMPARATORS

    return comparators.includes(comparator)
  }

  const isBooleanishComparator = computed(() => {
    return checkIsBooleanishComparator(item.value.comparator)
  })

  const isNonValueComparator = computed(() => {
    return checkIsNonValueComparator(item.value.comparator)
  })

  const isSelectorComparator = computed(() => {
    return checkIsSelectorComparator(item.value.comparator)
  })

  return {
    isBooleanishComparator,
    isNonValueComparator,
    isSelectorComparator,
    canUseSelectorComparator,
    checkIsBooleanishComparator,
    checkIsNonValueComparator,
    checkIsSelectorComparator,
  }
}

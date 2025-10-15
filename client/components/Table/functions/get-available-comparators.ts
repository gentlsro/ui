import type { ComparatorEnum } from '$comparatorEnum'
import type { ExtendedDataType } from '$dataType'

// Functions
import { getComparatorsByDataType } from '#layers/utilities/shared/constants/comparators-by-datatype.const'

// Constants
import { SELECTOR_COMPARATORS } from '$utils'

/**
 * Gets the available comparators for a given data type
 */
export function getAvailableComparators(
  dataType: ExtendedDataType,
  options: {
    includeSelectorComparators?: boolean
    allowedComparators?: ComparatorEnum[]
    extraComparators?: ComparatorEnum[]
  } = {},
): ComparatorEnum[] {
  const {
    includeSelectorComparators,
    allowedComparators,
    extraComparators = [],
  } = options

  const comparatorsByDataType = getComparatorsByDataType(dataType)
  const comparators: ComparatorEnum[] = [
    ...comparatorsByDataType,
    ...SELECTOR_COMPARATORS,
    ...extraComparators,
  ]

  if (allowedComparators) {
    return uniq(
      comparators.filter(comparator => allowedComparators.includes(comparator)),
    )
  } else if (!includeSelectorComparators) {
    return uniq([
      ...comparators.filter(comparator => {
        return !SELECTOR_COMPARATORS.includes(comparator)
      }),
      ...comparatorsByDataType,
      ...extraComparators,
    ])
  }

  return uniq([...comparators, ...extraComparators])
}

import utilsConfig from '$utilsConfig'
import type { ComparatorEnum } from '$comparatorEnum'
import type { ExtendedDataType } from '$dataType'

// Functions
import { getComparatorsByDataType } from '#layers/utilities/app/constants/comparators-by-datatype.const'

// Constants
import { getSelectorComparators } from '#layers/utilities/app/constants/comparators-by-category.const'

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

  const selectorComparators = getSelectorComparators(utilsConfig.dataTypeExtend.selectorComparators)
  const comparatorsByDataType = getComparatorsByDataType(
    dataType,
    utilsConfig.dataTypeExtend.comparatorsByDataType,
  )
  const comparators: ComparatorEnum[] = [
    ...comparatorsByDataType,
    ...selectorComparators,
    ...extraComparators,
  ]

  if (allowedComparators) {
    return uniq(
      comparators.filter(comparator => allowedComparators.includes(comparator)),
    )
  } else if (!includeSelectorComparators) {
    return uniq([
      ...comparators.filter(comparator => {
        return !selectorComparators.includes(comparator)
      }),
      ...comparatorsByDataType,
      ...extraComparators,
    ])
  }

  return uniq([...comparators, ...extraComparators])
}

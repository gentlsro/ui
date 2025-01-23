// Types
import type { ISelectorProps } from '../types/selector-props.type'

/**
 * Will take an array of primitives and transforms it to an array of objects
 * Will not do anything to an array of objects
 */
export function selectorTransformOptions(
  items: any,
  options: Pick<ISelectorProps, 'optionKey' | 'optionLabel'>,
): IItem[] {
  if (!items) {
    return []
  }

  const { optionKey = 'id', optionLabel = 'label' } = options

  if (Array.isArray(items)) {
    return items.map(item => {
      if (typeof item === 'object') {
        return item
      }

      const optionLabelKey = typeof optionLabel === 'function'
        ? 'label' // Fallback for when `optionLabel` is a function
        : optionLabel

      const optionLabelValue = typeof optionLabel === 'function'
        ? optionLabel(item)
        : item

      return {
        [optionKey]: item,
        [optionLabelKey]: String(optionLabelValue),
      }
    })
  }

  return []
}

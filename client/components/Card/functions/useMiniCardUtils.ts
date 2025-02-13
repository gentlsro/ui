// Types
import type { IMiniCardProps } from '../types/mini-card-props.type'

export function useMiniCardUtils() {
  function getMiniCardProps(props: IMiniCardProps) {
    return reactivePick(props, [
      'label',
      'value',
      'dataType',
      'format',
      'emptyValueString',
      'emptyValue',
      'to',
      'icon',
      'row',
      'toPreviousValue',
      'previousValue',
      'originalValue',
    ])
  }

  return {
    getMiniCardProps,
  }
}

// Types
import type { IValueFormatterProps } from '../types/value-formatter-props.type'

export function useValueFormatterUtils() {
  function getValueFormatterProps(props: IValueFormatterProps) {
    return reactivePick(props, [
      'value',
      'dataType',
      'format',
      'emptyValueString',
      'row',
      'emptyValue',
      'previousValue',
      'predictDataType',
    ])
  }

  return {
    getValueFormatterProps,
  }
}

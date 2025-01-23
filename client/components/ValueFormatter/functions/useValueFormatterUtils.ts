// Types
import type { ExtendedDataType } from '$dataType'
import type { IValueFormatterProps } from '../types/value-formatter-props.type'

// Models
import type { ComparatorEnum } from '$comparatorEnum'

type IFormatValueOptions = {
  dataType?: ExtendedDataType
  format?: (row: any, value: any, options?: Pick<IFormatValueOptions, 'dataType' | 'emptyValue' | 'comparator'>) => any
  emptyValue?: any
  predictDataType?: IValueFormatterProps['predictDataType']
  comparator?: ComparatorEnum
}

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

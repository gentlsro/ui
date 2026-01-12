import type { CSSProperties } from 'vue'

import type { PredictDataTypeOptions } from '#layers/utilities/shared/types/predict-data-type-options.type'

// Constants
import type { VALUE_FORMATTER_DEFAULT_PROPS } from '../constants/value-formatter-default-props.constant'

// Types
import type { ExtendedDataType } from '$dataType'

// Models
import type { ComparatorEnum } from '$comparatorEnum'

export type IValueFormatterProps = {
  value: any
  previousValue?: any
  dataType?: ExtendedDataType

  /**
   * A custom formatter function
   */
  format?: (row: any, value: any) => any

  /**
   * When the `value` is the same as `emptyValue`, the `emptyValueString` will be shown instead
   */
  emptyValue?: any

  /**
   * When the value is `null`, `undefined`, <empty string> or <empty array> or the `emptyValue` prop is set to the value,
   * this value will be shown instead
   */
  emptyValueString?: any

  /**
   * When provided the options, it tries to predit the `dataType` and format it accordingly
   * When explicit `dataType` is provided, this is ignored
   */
  predictDataType?: PredictDataTypeOptions

  /**
   * When used with object-based data, the row object is passed to the formatter
   * as well
   */
  row?: any

  /**
   * In some cases, we need to also provide the comparator because some of the
   * data types might support multiple value-resolving
   *
   * For example, the `date` data type can be either a regular date for all
   * comparators EXCEPT for `AGO` and `UNTIL` when it's actually a simple string
   */
  comparator?: ComparatorEnum

  /**
   * Visual configuration
   */
  ui?: {
    /**
     * Class for the container
     */
    containerClass?: (payload: {
      defaults: ReturnType<typeof VALUE_FORMATTER_DEFAULT_PROPS['ui']['containerClass']>
    }) => ClassType

    /**
     * Style for the container
     */
    containerStyle?: () => CSSProperties
  }
}

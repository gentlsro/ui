import type { CSSProperties } from 'vue'

// Types
import type { IValueFormatterProps } from '../../ValueFormatter/types/value-formatter-props.type'
import type { NavigateToOptions } from '#layers/utilities/client/types/navigate-to.type'

export type IMiniCardProps = IValueFormatterProps & {
  /**
   * The label of the card
   */
  label: string | number | (() => string | number)

  /**
   * The icon of the card
   */
  icon?: string

  /**
   * Whether the value should be bold or not
   */
  noBold?: boolean

  /**
   * The link we want to redirect to
   */
  to?: any | ((payload: { value: any, parsedValue: any, label?: string }) => any) // should be RouteLocationRaw but that breaks some projects for whatever reason

  /**
   * The options to pass to the NuxtLink component
   */
  navigateToOptions?: NavigateToOptions

  /**
   * The link we want to redirect to previous value
   */
  toPreviousValue?: any

  /**
   * The previous value of the field used to compare with current value
   */
  previousValue?: any

  /**
   * The original value of the field used to compare with current value
   */
  originalValue?: string

  /**
   * Visual configuration
   */
  ui?: {
    /**
     * Class to apply to the icon
     */
    iconClass?: ClassType

    /**
     * Style to apply to the icon
     */
    iconStyle?: CSSProperties

    /**
     * Class to apply to the label
     */
    labelClass?: ClassType

    /**
     * Style to apply to the label
     */
    labelStyle?: CSSProperties

    /**
     * Class to apply to the value
     */
    valueClass?: ClassType

    /**
     * Style to apply to the value
     */
    valueStyle?: CSSProperties

    /**
     * Class to apply to the previous value
     */
    previousValueClass?: ClassType

    /**
     * Style to apply to the previous value
     */
    previousValueStyle?: CSSProperties
  }
}

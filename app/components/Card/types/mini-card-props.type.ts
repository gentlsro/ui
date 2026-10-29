import type { UIClassPicker, UIResolvedClasses } from '../../../types/ui-class-config.type'
import type { CSSProperties } from 'vue'

// Types
import type { IValueFormatterProps } from '../../ValueFormatter/types/value-formatter-props.type'

// Constants
import type { NavigateToOptions } from '#layers/utilities/app/types/navigate-to.type'

export type IMiniCardProps = Omit<IValueFormatterProps, 'ui'> & {
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
     * Base class for the container
     */
    containerClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['miniCard']['containerClass']>
    }) => ClassType

    /**
     * Style for the container
     */
    containerStyle?: () => CSSProperties

    /**
     * Class for the icon container
     */
    iconContainerClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['miniCard']['iconContainerClass']>
    }) => ClassType

    /**
     * Style for the icon container
     */
    iconContainerStyle?: () => CSSProperties

    /**
     * Class to apply to the icon
     */
    iconClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['miniCard']['iconClass']>
    }) => ClassType

    /**
     * Style to apply to the icon
     */
    iconStyle?: () => CSSProperties

    /**
     * Class for the content wrapper
     */
    contentClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['miniCard']['contentClass']>
    }) => ClassType

    /**
     * Style for the content wrapper
     */
    contentStyle?: () => CSSProperties

    /**
     * Class to apply to the label
     */
    labelClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['miniCard']['labelClass']>
    }) => ClassType

    /**
     * Style to apply to the label
     */
    labelStyle?: () => CSSProperties

    /**
     * Class to apply to the value
     */
    valueClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['miniCard']['valueClass']>
    }) => ClassType

    /**
     * Style to apply to the value
     */
    valueStyle?: () => CSSProperties

    /**
     * Class to apply to the previous value
     */
    previousValueClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['miniCard']['previousValueClass']>
    }) => ClassType

    /**
     * Style to apply to the previous value
     */
    previousValueStyle?: () => CSSProperties
  }
}

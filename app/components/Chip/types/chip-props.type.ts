import type { UIClassPicker, UIResolvedClasses } from '../../../types/ui-class-config.type'
import type { AllowedComponentProps, CSSProperties } from 'vue'

// Types
import type { IBtnProps, INavigation } from '../../Button/types/btn-props.type'
import type { ITooltipProps } from '../../Tooltip/types/tooltip-props.type'

export type IChipProps = INavigation & {
  /**
   * Whether the chip has the CopyBtn
   */
  hasCopy?: boolean

  /**
   * Whether the chip has the button to remove it
   */
  hasRemove?: boolean

  /**
   * The chip's icon
   */
  icon?: ClassType

  /**
   * The chip's label
   */
  label?: string | number | (() => string | number)

  /**
   * Partial props for the remove button
   */
  removeBtn?: Partial<IBtnProps> & AllowedComponentProps

  /**
   * Whether the chip has the ripple effect
   */
  ripple?: boolean

  /**
   * Whether the chip centered
   */
  center?: boolean

  /**
   * Tooltip configuration
   */
  tooltip?: {
    label?: string
    props?: Partial<ITooltipProps> & AllowedComponentProps
  }

  /**
   * Visual configuration
   */
  ui?: {
    /**
     * The chip's container class
     */
    containerClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['chip']['containerClass']>
    }) => ClassType

    /**
     * The chip's container style
     */
    containerStyle?: () => CSSProperties

    /**
     * The chip's label class
     */
    labelClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['chip']['labelClass']>
    }) => ClassType

    /**
     * The chip's label style
     */
    labelStyle?: () => CSSProperties
  }
}

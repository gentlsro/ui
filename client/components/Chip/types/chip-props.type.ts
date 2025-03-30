import type { AllowedComponentProps } from 'vue'

// Types
import type { INavigation } from '../../Button/types/btn-props.type'
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
   * The chip's label class
   */
  labelClass?: ClassType

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
}

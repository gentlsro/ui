import type { UIClasses, UIResolvedClasses } from '../../../types/ui-config.type'
import type { WithClassPicker } from '../../../functions/with-class-picker'
import type { AllowedComponentProps, CSSProperties } from 'vue'

// Types
import type { IBtnProps, INavigation } from '../../Button/types/btn-props.type'
import type { ITooltipProps } from '../../Tooltip/types/tooltip-props.type'

// Constants
import type { CHIP_DEFAULT_PROPS } from '../constants/chip-default-props.constant'

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
  ui?: UIClasses<{
    /**
     * The chip's container class
     */
    containerClass?: (payload: WithClassPicker<{
      defaults: ReturnType<typeof CHIP_DEFAULT_PROPS['ui']['containerClass']>
    }>) => ClassType

    /**
     * The chip's container style
     */
    containerStyle?: () => CSSProperties

    /**
     * The chip's label class
     */
    labelClass?: (payload: WithClassPicker<{
      defaults: ReturnType<typeof CHIP_DEFAULT_PROPS['ui']['labelClass']>
    }>) => ClassType

    /**
     * The chip's label style
     */
    labelStyle?: () => CSSProperties
  }, UIResolvedClasses['chip']>
}

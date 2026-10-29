import type { WithClassPicker } from '../../../functions/with-class-picker'
import type { AllowedComponentProps, CSSProperties } from 'vue'

// Types
import type { IBtnProps } from '../../Button/types/btn-props.type'

// Constants
import type { BUTTON_GROUP_DEFAULT_PROPS } from '../constants/button-group-default-props.constant'

export type IButtonGroupProps = {
  /**
   * How the group looks
   * - `pill`: the buttons in a rounded outline, the active one filled with the primary color
   * - `segmented`: the buttons in one recessed track, the active one raised; compact, for dense panels
   */
  variant?: 'pill' | 'segmented'

  /**
   * Whether the buttons are disabled
   */
  disabled?: boolean

  /**
   * The value of the active button
   */
  modelValue?: string | number

  /**
   * A list of buttons in the group
   */
  buttons: Array<IBtnProps & AllowedComponentProps & { value: any }>

  /**
   * Visual configuration
   */
  ui?: {
    /**
     * Base class for the container
     */
    containerClass?: (payload: WithClassPicker<{
      defaults: ReturnType<typeof BUTTON_GROUP_DEFAULT_PROPS['ui']['containerClass']>
    }>) => ClassType

    /**
     * Class applied to every button
     */
    buttonClass?: (payload: WithClassPicker<{
      defaults: ReturnType<typeof BUTTON_GROUP_DEFAULT_PROPS['ui']['buttonClass']>
    }>) => ClassType

    /**
     * Style for the container
     */
    containerStyle?: () => CSSProperties

    /**
     * Class applied to the active button
     */
    activeClass?: (payload: WithClassPicker<{
      defaults: ReturnType<typeof BUTTON_GROUP_DEFAULT_PROPS['ui']['activeClass']>
    }>) => ClassType

    /**
     * Style applied to the active button
     */
    activeStyle?: () => CSSProperties
  }
}

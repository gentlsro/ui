import type { CSSProperties } from 'vue'

// Types
import type { IBtnProps } from '../../Button/types/btn-props.type'

// Constants
import type { BUTTON_GROUP_DEFAULT_PROPS } from '../constants/button-group-default-props.constant'

export type IButtonGroupProps = {
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
  buttons: Array<IBtnProps & { value: any }>

  /**
   * Visual configuration
   */
  ui?: {
    /**
     * Base class for the container
     */
    containerClass?: (payload: {
      defaults: ReturnType<typeof BUTTON_GROUP_DEFAULT_PROPS['ui']['containerClass']>
    }) => ClassType

    /**
     * Style for the container
     */
    containerStyle?: () => CSSProperties

    /**
     * Class applied to the active button
     */
    activeClass?: (payload: {
      defaults: ReturnType<typeof BUTTON_GROUP_DEFAULT_PROPS['ui']['activeClass']>
    }) => ClassType

    /**
     * Style applied to the active button
     */
    activeStyle?: () => CSSProperties
  }
}

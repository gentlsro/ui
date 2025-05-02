import type { CSSProperties } from 'vue'

// Types
import type { IBtnProps } from '../../Button/types/btn-props.type'

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
     * Class applied to the active button
     */
    activeClass?: ClassType

    /**
     * Style applied to the active button
     */
    activeStyle?: CSSProperties
  }
}

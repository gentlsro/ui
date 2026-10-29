import type { UIClassPicker, UIResolvedClasses } from '../../../types/ui-class-config.type'
import type { AllowedComponentProps, CSSProperties } from 'vue'

// Types
import type { IBtnProps } from '../../Button/types/btn-props.type'

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
    containerClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['buttonGroup']['containerClass']>
    }) => ClassType

    /**
     * Class applied to every button
     */
    buttonClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['buttonGroup']['buttonClass']>
    }) => ClassType

    /**
     * Style for the container
     */
    containerStyle?: () => CSSProperties

    /**
     * Class applied to the active button
     */
    activeClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['buttonGroup']['activeClass']>
    }) => ClassType

    /**
     * Style applied to the active button
     */
    activeStyle?: () => CSSProperties
  }
}

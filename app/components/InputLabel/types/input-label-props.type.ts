import type { CSSProperties } from 'vue'

// Constants
import type { INPUT_LABEL_DEFAULT_PROPS } from '../constants/input-label-default-props'

export type IInputLabelProps = {
  /**
   * The color of the label when it's active
   *
   * NOTE: This needs to be a HEX, RGBA or CSS variable like var(--primary-color)
   * It cannot be an unocss variable or anything alike
   */

  activeLabelColor?: string

  /**
   * Whether the input has content or not
   */
  hasContent?: boolean

  /**
   * The input's id
   */
  id?: string

  /**
   * The input's label
   */
  label?: string | (() => string)

  /**
   * The input's placeholder
   */
  placeholder?: string

  /**
   * The input's layout
   */
  layout?: 'inline' | 'label-inside' | 'regular'

  /**
   * Adds `*` ater the label to indicate it's a required field
   */
  required?: boolean

  /**
   * The input's size
   */
  size?: 'sm' | 'md' | 'lg'

  /**
   * When true, the label will be `floating` even when with no content
   */
  stackLabel?: boolean

  /**
   * Visual configuration
   */
  ui?: {
    /**
     * Class applied to the label
     */
    labelClass?: (payload: {
      defaults: ReturnType<typeof INPUT_LABEL_DEFAULT_PROPS['ui']['labelClass']>
    }) => ClassType

    /**
     * Style applied to the label
     */
    labelStyle?: () => CSSProperties

    /**
     * Style of the label
     *
     * Note: You should probably not use this, this is for special cases when
     * we are not able to pass actual function (= maybe we are passing some JSON-ified style object)
     */
    labelStyleObj?: CSSProperties

    /**
     * The width of the label when it's in inline mode (use actual CSS syntax)
     */
    labelInlineWidth?: string
  }
}

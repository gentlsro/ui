import type { CSSProperties } from 'vue'

// Types

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
    labelClass?: ClassType

    /**
     * Style applied to the label
     */
    labelStyle?: CSSProperties
  }
}

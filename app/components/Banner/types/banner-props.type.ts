import type { UIClassPicker, UIResolvedClasses } from '../../../types/ui-class-config.type'
import type { CSSProperties } from 'vue'

export type IBannerProps = {
  /**
   * The number in top right corner on the `Banner`
   */
  counter?: number

  /**
   * Whether the `Banner` should be dismissed on click
   */
  dismissable?: boolean

  /**
   * Whether the icon should be centered with the text
   */
  iconCenter?: boolean

  /**
   * The label of the `Banner`
   */
  label?: string

  /**
   * Whether the `Banner` is visible
   */
  modelValue?: boolean

  /**
   * Whether the `Banner` should have the appear transition
   */
  noTransition?: boolean

  /**
   * Whether the `Banner` is "outlined" ~ with a border and dimmed background
   */
  outlined?: boolean

  /**
   * Type of the `Banner`
   */
  variant?: 'error' | 'info' | 'success' | 'warning'

  /**
   * Visual configuration
   */
  ui?: {

    /**
     * Class for the counter badge
     */
    badgeClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['banner']['badgeClass']>
    }) => ClassType

    /**
     * Style for the counter badge
     */
    badgeStyle?: () => CSSProperties

    /**
     * Class for the container
     */
    containerClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['banner']['containerClass']>
    }) => ClassType

    /**
     * Style for the container
     */
    containerStyle?: () => CSSProperties

    /**
     * Class for the label
     */
    labelClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['banner']['labelClass']>
    }) => ClassType

    /**
     * Style for the label
     */
    labelStyle?: () => CSSProperties

    /**
     * Class for the icon
     */
    iconClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['banner']['iconClass']>
    }) => ClassType

    /**
     * Style for the icon
     */
    iconStyle?: () => CSSProperties

    /**
     * Class for the dismiss indicator (shown when `dismissable`)
     */
    dismissClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['banner']['dismissClass']>
    }) => ClassType

    /**
     * Style for the dismiss indicator
     */
    dismissStyle?: () => CSSProperties
  }
}

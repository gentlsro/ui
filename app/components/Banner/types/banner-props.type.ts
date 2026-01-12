import type { CSSProperties } from 'vue'

// Constants
import type { BANNER_DEFAULT_PROPS } from '../constants/banner-default-props.constant'

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
     * Base class for the `Banner`
     */
    badgeClass?: (payload: {
      defaults: ReturnType<typeof BANNER_DEFAULT_PROPS['ui']['badgeClass']>
    }) => ClassType

    /**
     * Style for the base
     */
    badgeStyle?: () => CSSProperties

    /**
     * Class for the container
     */
    containerClass?: (payload: {
      defaults: ReturnType<typeof BANNER_DEFAULT_PROPS['ui']['containerClass']>
    }) => ClassType

    /**
     * Style for the container
     */
    containerStyle?: () => CSSProperties

    /**
     * Class for the label
     */
    labelClass?: (payload: {
      defaults: ReturnType<typeof BANNER_DEFAULT_PROPS['ui']['labelClass']>
    }) => ClassType

    /**
     * Style for the label
     */
    labelStyle?: () => CSSProperties

    /**
     * Class for the icon
     */
    iconClass?: (payload: {
      defaults: ReturnType<typeof BANNER_DEFAULT_PROPS['ui']['iconClass']>
    }) => ClassType

    /**
     * Style for the icon
     */
    iconStyle?: () => CSSProperties
  }
}

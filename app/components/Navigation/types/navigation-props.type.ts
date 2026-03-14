import type { CSSProperties } from 'vue'

// Constants
import type { NAVIGATION_DEFAULT_PROPS } from '../constants/navigation-default-props.constant'

export type INavigationProps = {
  /**
   * When true, the navigation will not include the toolbar
   */
  noToolbar?: boolean

  /**
   * When true, the navigation will not have a shadow
   */
  noShadow?: boolean

  /**
   * When true, the navigation will not hide when scrolling
   */
  noHide?: boolean

  /**
   * When true, the navigation will have the `position: sticky` instead of `position: fixed`
   */
  sticky?: boolean

  /**
   * Visual configuration
   */
  ui?: {
    /**
     * Class to apply to the header (wrapper)
     */
    headerClass?: (payload: {
      defaults: ReturnType<typeof NAVIGATION_DEFAULT_PROPS['ui']['headerClass']>
    }) => ClassType

    /**
     * Style to apply to the header (wrapper)
     */
    headerStyle?: () => CSSProperties

    /**
     * Class to apply to the navigation
     */
    navigationClass?: (payload: {
      defaults: ReturnType<typeof NAVIGATION_DEFAULT_PROPS['ui']['navigationClass']>
    }) => ClassType

    /**
     * Style to apply to the navigation
     */
    navigationStyle?: () => CSSProperties
  }
}

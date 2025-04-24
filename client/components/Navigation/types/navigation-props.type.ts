import type { CSSProperties } from 'vue'

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
    headerClass?: ClassType

    /**
     * Style to apply to the header (wrapper)
     */
    headerStyle?: CSSProperties

    /**
     * Class to apply to the navigation
     */
    navigationClass?: ClassType

    /**
     * Style to apply to the navigation
     */
    navigationStyle?: CSSProperties
  }
}

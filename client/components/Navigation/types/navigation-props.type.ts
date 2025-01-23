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
   * Visual configuration
   */
  ui?: {
    /**
     * Class to apply to the navigation
     */
    navigationClass?: ClassType

    /**
     * Style to apply to the navigation
     */
    navigationStyle?: CSSProperties

    /**
     * Class to apply to the toolbar
     */
    toolbarClass?: ClassType

    /**
     * Style to apply to the toolbar
     */
    toolbarStyle?: CSSProperties
  }
}

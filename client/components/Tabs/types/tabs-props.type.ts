import type { CSSProperties, KeepAliveProps } from 'vue'

export type ITabsProps = {
  /**
   * Currently active tab's name
   */
  modelValue?: string | number

  /**
   * When true, the navigation will not be shown
   */
  noNav?: boolean

  /**
   * The props that should be passed to the KeepAlive
   *
   * NOTE: If not used, there will be no `KeepAlive`
   * NOTE 2: If using `include` or `exclude`, you need to prefix the names with `Tab_`
   */
  keepAliveProps?: KeepAliveProps

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
     * Class to apply to the navigation content (inner class of the `HorizontalScroller`)
     */
    navigationContentClass?: ClassType

    /**
     * Style to apply to the navigation content (inner style of the `HorizontalScroller`)
     */
    navigationContentStyle?: CSSProperties

    /**
     * Class to apply to the content
     */
    tabClass?: ClassType

    /**
     * Style to apply to the content
     */
    tabStyle?: CSSProperties

    /**
     * Class to apply to the tab's navigation button
     */
    tabNavBtnClass?: (isActive: boolean) => ClassType

    /**
     * Style to apply to the tab's navigation button
     */
    tabNavBtnStyle?: (isActive: boolean) => CSSProperties
  }
}

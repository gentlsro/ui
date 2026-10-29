import type { UIClassPicker, UIResolvedClasses } from '../../../types/ui-class-config.type'
import type { CSSProperties, KeepAliveProps } from 'vue'

// Types

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
     * Class to apply to the container
     */
    containerClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['tabs']['containerClass']>
    }) => ClassType

    /**
     * Style to apply to the container
     */
    containerStyle?: () => CSSProperties

    /**
     * Class to apply to the navigation
     */
    navigationClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['tabs']['navigationClass']>
    }) => ClassType

    /**
     * Style to apply to the navigation
     */
    navigationStyle?: () => CSSProperties

    /**
     * Class to apply to the navigation content (inner class of the `HorizontalScroller`)
     */
    navigationContentClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['tabs']['navigationContentClass']>
    }) => ClassType

    /**
     * Style to apply to the navigation content (inner style of the `HorizontalScroller`)
     */
    navigationContentStyle?: () => CSSProperties

    /**
     * Class to apply to the content
     */
    tabClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['tabs']['tabClass']>
    }) => ClassType

    /**
     * Style to apply to the content
     */
    tabStyle?: () => CSSProperties

    /**
     * Class to apply to the tab's navigation button
     * Note: Use `is-active` CSS selector for active state styling
     */
    tabNavBtnClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['tabs']['tabNavBtnClass']>
    }) => ClassType

    /**
     * Style to apply to the tab's navigation button
     */
    tabNavBtnStyle?: () => CSSProperties
  }
}

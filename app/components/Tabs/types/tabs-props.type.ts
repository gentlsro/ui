import type { CSSProperties, KeepAliveProps } from 'vue'

// Types
import type { TABS_DEFAULT_PROPS } from '../constants/tabs-default-props.constant'

export type ITabsProps = {
  /**
   * Currently active tab's name
   */
  modelValue?: string | number

  /**
   * When true, the navigation will not be shown
   */
  noNav?: boolean

  /** Accessible name of the default tablist. Defaults to the localized Tabs label. */
  navigationLabel?: string

  /** Arrow keys move focus; manual mode selects with Enter/Space or a click. */
  activationMode?: 'manual' | 'automatic'

  /**
   * The props that should be passed to the KeepAlive
   *
   * NOTE: If not used, only Tab declarations with keepAlive=true are cached.
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
      defaults: ReturnType<typeof TABS_DEFAULT_PROPS['ui']['containerClass']>
    }) => ClassType

    /**
     * Style to apply to the container
     */
    containerStyle?: () => CSSProperties

    /**
     * Class to apply to the navigation
     */
    navigationClass?: (payload: {
      defaults: ReturnType<typeof TABS_DEFAULT_PROPS['ui']['navigationClass']>
    }) => ClassType

    /**
     * Style to apply to the navigation
     */
    navigationStyle?: () => CSSProperties

    /**
     * Class to apply to the navigation content (inner class of the `HorizontalScroller`)
     */
    navigationContentClass?: (payload: {
      defaults: ReturnType<typeof TABS_DEFAULT_PROPS['ui']['navigationContentClass']>
    }) => ClassType

    /**
     * Style to apply to the navigation content (inner style of the `HorizontalScroller`)
     */
    navigationContentStyle?: () => CSSProperties

    /**
     * Class to apply to the content
     */
    tabClass?: (payload: {
      defaults: ReturnType<typeof TABS_DEFAULT_PROPS['ui']['tabClass']>
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
      defaults: ReturnType<typeof TABS_DEFAULT_PROPS['ui']['tabNavBtnClass']>
    }) => ClassType

    /**
     * Style to apply to the tab's navigation button
     */
    tabNavBtnStyle?: () => CSSProperties
  }
}

import type { CSSProperties } from 'vue'

export type ICollapseProps = {
  /**
   * When true, the content's height will be watched and every change will trigger
   * a transition
   */
  autoAdjustHeight?: boolean

  /**
   * The icon for `Collapse` expansion
   *
   * Note: Will get rotated 90 degrees when `isOpen` is `true`
   */
  expandIcon?: (isOpen: boolean) => ClassType

  /**
   * The height of the content
   *
   * NOTE: By default, the height is based on the actual content
   */
  contentHeight?: number

  /**
   * When true, the content will have a `position: absolute`
   */
  floating?: boolean

  /**
   * The header icon
   */
  icon?: ClassType

  /**
   * Whether the `Collapse` is loading
   */
  loading?: boolean

  /**
   * The maximum height for the content
   */
  maxContentHeight?: number

  /**
   * State of the `Collapse` open/closed
   */
  modelValue?: boolean

  /**
   * When true, the expand icon will not be shown
   */
  noExpandIcon?: boolean

  /**
   * By default, when `Collapse` is open, we show a separator between the header
   * and the content. This prop can be used to disable that.
   */
  noSeparator?: boolean

  /**
   * When true, the `Collapse` will not use the expand/collapse transition
   */
  noTransition?: boolean

  /**
   * The subtitle of the `Collapse`
   */
  subtitle?: string

  /**
   * The title of the `Collapse`
   */
  title?: string

  /**
   * Visual configuration of the `Collapse`
   */
  ui?: {
    /**
     * Class for the content of the `Collapse`
     */
    contentClass?: (isOpen: boolean) => ClassType

    /**
     * Style for the content of the `Collapse`
     */
    contentStyle?: (isOpen: boolean) => CSSProperties

    /**
     * Class for the header of the `Collapse`
     */
    headerClass?: (isOpen: boolean) => ClassType

    /**
     * Style for the header of the `Collapse`
     */
    headerStyle?: (isOpen: boolean) => CSSProperties

    /**
     * Class that will be applied to the title
     */
    titleClass?: (isOpen: boolean) => ClassType

    /**
     * Style that will be applied to the title
     */
    titleStyle?: (isOpen: boolean) => CSSProperties

    /**
     * Class that will be applied to the subtitle
     */
    subtitleClass?: (isOpen: boolean) => ClassType

    /**
     * Style that will be applied to the subtitle
     */
    subtitleStyle?: (isOpen: boolean) => CSSProperties
  }

  /**
   * Functions that gets called before teh collapse is shown
   *
   * Usage: Fetching data to show in the collapse
   * If the function returns a `false` the collapse will not be shown at all
   */
  beforeShowFnc?: () => Promise<void> | void
}

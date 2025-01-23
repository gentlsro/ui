import type { CSSProperties } from 'vue'

export type ICollapseProps = {
  /**
   * The icon for `Collapse` expansion
   *
   * Note: Will get rotated 90 degrees when `isOpen` is `true`
   */
  expandIcon?: (isOpen: boolean) => ClassType

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
   * State of the `Collapse` open/closed
   */
  modelValue?: boolean

  /**
   * By default, when `Collapse` is open, we show a separator between the header
   * and the content. This prop can be used to disable that.
   */
  noSeparator?: boolean

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

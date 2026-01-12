import type { CSSProperties } from 'vue'

// Constants
import type { COLLAPSE_DEFAULT_PROPS } from '../constants/collapse-default-props.constant'

export type ICollapseProps = {
  /**
   * When true, the content's height will be watched and every change will trigger
   * a transition
   */
  autoAdjustHeight?: boolean

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
   * When true, the `Collapse` will not try to calculate the height of the content,
   * it will "just render it". This will also turn off transitions.
   */
  noHeightCalculation?: boolean

  /**
   * When true, the `Collapse` will not use the expand/collapse transition
   */
  noTransition?: boolean

  /**
   * The subtitle of the `Collapse`
   */
  subtitle?: string | (() => string)

  /**
   * The title of the `Collapse`
   */
  title?: string | (() => string)

  /**
   * Visual configuration of the `Collapse`
   */
  ui?: {
    /**
     * Class for the container of the `Collapse`
     */
    containerClass?: (payload: {
      defaults: ReturnType<typeof COLLAPSE_DEFAULT_PROPS['ui']['containerClass']>
    }) => ClassType

    /**
     * Style for the container of the `Collapse`
     */
    containerStyle?: () => CSSProperties

    /**
     * Class for the content of the `Collapse`
     */
    contentClass?: (payload: {
      defaults: ReturnType<typeof COLLAPSE_DEFAULT_PROPS['ui']['contentClass']>
    }) => ClassType

    /**
     * Style for the content of the `Collapse`
     */
    contentStyle?: () => CSSProperties

    /**
     * Class for the header of the `Collapse`
     */
    headerClass?: (payload: {
      defaults: ReturnType<typeof COLLAPSE_DEFAULT_PROPS['ui']['headerClass']>
    }) => ClassType

    /**
     * Style for the header of the `Collapse`
     */
    headerStyle?: () => CSSProperties

    /**
     * Class that will be applied to the title
     */
    titleClass?: (payload: {
      defaults: ReturnType<typeof COLLAPSE_DEFAULT_PROPS['ui']['titleClass']>
    }) => ClassType

    /**
     * Style that will be applied to the title
     */
    titleStyle?: () => CSSProperties

    /**
     * Class that will be applied to the right side of the header (where `loader` and `expand icon` are placed)
     */
    headerRightClass?: (payload: {
      defaults: ReturnType<typeof COLLAPSE_DEFAULT_PROPS['ui']['headerRightClass']>
    }) => ClassType

    /**
     * Style that will be applied to the right side of the header (where `loader` and `expand icon` are placed)
     */
    headerRightStyle?: () => CSSProperties

    /**
     * Class that will be applied to the subtitle
     */
    subtitleClass?: (payload: {
      defaults: ReturnType<typeof COLLAPSE_DEFAULT_PROPS['ui']['subtitleClass']>
    }) => ClassType

    /**
     * Style that will be applied to the subtitle
     */
    subtitleStyle?: () => CSSProperties

    /**
     * Class that will be applied to the expand icon
     */
    expandIconClass?: (payload: {
      defaults: ReturnType<typeof COLLAPSE_DEFAULT_PROPS['ui']['expandIconClass']>
    }) => ClassType

    /**
     * Style that will be applied to the expand icon
     */
    expandIconStyle?: () => CSSProperties

    /**
     * Class that will be applied to the text part of the header (where `title` and `subtitle` are placed)
     */
    textClass?: (payload: {
      defaults: ReturnType<typeof COLLAPSE_DEFAULT_PROPS['ui']['textClass']>
    }) => ClassType

    /**
     * Style that will be applied to the text part of the header (where `title` and `subtitle` are placed)
     */
    textStyle?: () => CSSProperties
  }

  /**
   * Functions that gets called before the collapse is shown
   *
   * Usage: Fetching data to show in the collapse
   * If the function returns a `false` the collapse will not be shown at all
   */
  beforeShowFnc?: () => Promise<void | false> | void | false
}

import type { UIClassPicker, UIResolvedClasses } from '../../../types/ui-class-config.type'
import type { CSSProperties } from 'vue'

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
      defaults: UIClassPicker<UIResolvedClasses['collapse']['containerClass']>
    }) => ClassType

    /**
     * Style for the container of the `Collapse`
     */
    containerStyle?: () => CSSProperties

    /**
     * Class for the content of the `Collapse`
     */
    contentClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['collapse']['contentClass']>
    }) => ClassType

    /**
     * Style for the content of the `Collapse`
     */
    contentStyle?: () => CSSProperties

    /**
     * Class for the inner content wrapper of the `Collapse` (the padded area around the slot)
     */
    contentInnerClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['collapse']['contentInnerClass']>
    }) => ClassType

    /**
     * Style for the inner content wrapper of the `Collapse`
     */
    contentInnerStyle?: () => CSSProperties

    /**
     * Class for the header of the `Collapse`
     */
    headerClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['collapse']['headerClass']>
    }) => ClassType

    /**
     * Style for the header of the `Collapse`
     */
    headerStyle?: () => CSSProperties

    /**
     * Class that will be applied to the title
     */
    titleClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['collapse']['titleClass']>
    }) => ClassType

    /**
     * Style that will be applied to the title
     */
    titleStyle?: () => CSSProperties

    /**
     * Class that will be applied to the right side of the header (where `loader` and `expand icon` are placed)
     */
    headerRightClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['collapse']['headerRightClass']>
    }) => ClassType

    /**
     * Style that will be applied to the right side of the header (where `loader` and `expand icon` are placed)
     */
    headerRightStyle?: () => CSSProperties

    /**
     * Class that will be applied to the subtitle
     */
    subtitleClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['collapse']['subtitleClass']>
    }) => ClassType

    /**
     * Style that will be applied to the subtitle
     */
    subtitleStyle?: () => CSSProperties

    /**
     * Class that will be applied to the expand icon
     */
    expandIconClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['collapse']['expandIconClass']>
    }) => ClassType

    /**
     * Style that will be applied to the expand icon
     */
    expandIconStyle?: () => CSSProperties

    /**
     * Class that will be applied to the text part of the header (where `title` and `subtitle` are placed)
     */
    textClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['collapse']['textClass']>
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

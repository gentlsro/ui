import type { UIClassPicker, UIResolvedClasses } from '../../../types/ui-class-config.type'
import type { CSSProperties } from 'vue'
import type { MaybeElement } from '@floating-ui/vue'

import type {
  OffsetOptions,
  Placement,
  ReferenceElement,
} from '@floating-ui/dom'

export type ITooltipProps = {
  /**
   * The tooltip content
   */
  content?: {
    /**
     * The tooltip title
     */
    title?: string

    /**
     * The tooltip description
     */
    description?: string
  }

  /**
   * The tooltip delay in milliseconds => [showDelay, hideDelay]
   */
  delay?: [number, number]

  /*
   * Whether the tooltip is open by manually providing the `modelValue`
   */
  manual?: boolean

  /**
   * The pointer interaction used to open and close the tooltip
   */
  mode?: 'hover' | 'click'

  /**
   * The tooltip model value
   */
  modelValue?: boolean

  /**
   * When true, the `Menu` will not have an arrow
   */
  noArrow?: boolean

  /**
   * When true, the font style will be reset
   *
   * Usage: when using tooltip inside a `Btn`, the font style would inherit the boldness
   * and other stuff that we don't want in tooltip
   */
  noInheritFontStyle?: boolean

  /**
   * The FloatingUI offset options
   */
  offset?: OffsetOptions

  /**
   * The FloatingUI placement
   */
  placement?: Placement

  /**
   * This prop is not used in <Dialog /> but it needs to be here because <Menu /> uses it
   * therefore <MenuProxy /> uses it. If it wasn't here, the HTML would try
   * to stringify it and throw an error.
   */
  referenceTarget?: MaybeElement<ReferenceElement> | HTMLElement | string | null

  /**
   * Visual configuration
   */
  ui?: {
    /**
     * Class for the tooltip container
     */
    containerClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['tooltip']['containerClass']>
    }) => ClassType

    /**
     * Style for the tooltip container
     */
    containerStyle?: () => CSSProperties

    /**
     * Class for the tooltip content
     */
    contentClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['tooltip']['contentClass']>
    }) => ClassType

    /**
     * Style for the tooltip content
     */
    contentStyle?: () => CSSProperties

    /**
     * Class for the tooltip title
     */
    titleClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['tooltip']['titleClass']>
    }) => ClassType

    /**
     * Style for the tooltip title
     */
    titleStyle?: () => CSSProperties

    /**
     * Class for the tooltip description
     */
    descriptionClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['tooltip']['descriptionClass']>
    }) => ClassType

    /**
     * Style for the tooltip description
     */
    descriptionStyle?: () => CSSProperties

    /**
     * Class for the arrow
     */
    arrowClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['tooltip']['arrowClass']>
    }) => ClassType

    /**
     * Style for the arrow
     */
    arrowStyle?: () => CSSProperties
  }
}

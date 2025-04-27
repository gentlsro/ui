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
     * The tooltip class
     */
    tooltipClass?: ClassType

    /**
     * The tooltip style
     */
    tooltipStyle?: CSSProperties

    /**
     * The tooltip content class
     */
    contentClass?: ClassType

    /**
     * The tooltip content style
     */
    contentStyle?: CSSProperties

    /**
     * The tooltip title class
     */
    titleClass?: ClassType

    /**
     * The tooltip title style
     */
    titleStyle?: CSSProperties

    /**
     * The tooltip description class
     */
    descriptionClass?: ClassType

    /**
     * The tooltip description style
     */
    descriptionStyle?: CSSProperties
  }
}

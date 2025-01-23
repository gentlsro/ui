import type { MaybeElement } from '@floating-ui/vue'

import type {
  OffsetOptions,
  Placement,
  ReferenceElement,
} from '@floating-ui/dom'

export type ITooltipProps = {
  /**
   * The tooltip delay in milliseconds => [showDelay, hideDelay]
   */
  delay?: [number, number]

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
}

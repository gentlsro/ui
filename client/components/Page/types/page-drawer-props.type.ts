// Types
import type { CSSProperties } from 'vue'
import type { BREAKPOINTS } from '../../../../shared/constants/breakpoints'

export type IPageDrawerProps = {
  /**
   * At which breakpoint the drawer becomes absolutely positioned
   * Note: Use `xs` to never go into absolute mode
   */
  absoluteBreakpoint?: keyof typeof BREAKPOINTS

  /**
   * At which breakpoint the drawer becomes absolutely positioned and full width
   * Note: Use `xs` to never get into the absolute full width mode
   */
  absoluteFullWidthBreakpoint?: keyof typeof BREAKPOINTS

  /**
   * When true, the drawer will take up the full height of the page, including
   * the navigation bar
   */
  fullHeight?: boolean

  /**
   * Whether the is currently in the `mini` mode
   */
  mini: boolean

  /**
   * The width of the drawer in `mini` mode
   */
  miniWidth?: number

  /**
   * Whether the drawer is currently open
   */
  modelValue: boolean

  /**
   * Whether to show the bottom part of the drawer
   */
  noBottom?: boolean

  /**
   * The side on the page for the drawer
   */
  side?: 'left' | 'right'

  /**
   * The width of the drawer
   */
  width?: number

  /**
   * Visual configuration
   */
  ui?: {
    /**
     * Class to apply to the content
     */
    contentClass?: (isMini: boolean) => ClassType

    /**
     * Style to apply to the content
     */
    contentStyle?: (isMini: boolean) => CSSProperties

    /**
     * Class to apply to the bottom part of the drawer
     */
    bottomClass?: (isMini: boolean) => ClassType

    /**
     * Style to apply to the bottom part of the drawer
     */
    bottomStyle?: (isMini: boolean) => CSSProperties

    /**
     * Class to apply to the filler (the top part of the drawer)
     */
    fillerClass?: (isMini: boolean) => ClassType

    /**
     * Style to apply to the filler (the top part of the drawer)
     */
    fillerStyle?: (isMini: boolean) => CSSProperties
  }
}

import type { CSSProperties } from 'vue'

export type IHeadingProps = {
  /**
   * When true, the Heading will have a "filled" background, ie. `bg-ca` will be applied
   */
  filled?: boolean

  /**
   * When true:
   *  The filled title will have left highlight.
   *  The unfilled title will have bottom highlight
   */
  highlighted?: boolean

  ui?: {
    /**
     * Class to apply to the content
     */
    contentClass?: ClassType

    /**
     * Style to apply to the content
     */
    contentStyle?: CSSProperties
  }
}

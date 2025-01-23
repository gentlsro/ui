import type { CSSProperties } from 'vue'

export type IScrollerProps = {
  /**
   * When `arrows` is outside, the `Scroller` will create space on each side to fit the arrows
   * When `arrows` is inside, that arrows will be absolutely positioned in the scroller
   */
  arrows?: 'outside' | 'inside'

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

  /**
   * The scroll position
   */
  scrollPosition?: number
}

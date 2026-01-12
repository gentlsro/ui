import type { CSSProperties } from 'vue'

// Constants
import type { HEADING_DEFAULT_PROPS } from '../constants/heading-default-props.constant'

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
     * Class for the container
     */
    containerClass?: (payload: {
      defaults: ReturnType<typeof HEADING_DEFAULT_PROPS['ui']['containerClass']>
    }) => ClassType

    /**
     * Style for the container
     */
    containerStyle?: () => CSSProperties
  }
}

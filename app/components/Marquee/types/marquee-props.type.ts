import type { CSSProperties } from 'vue'

// Constants
import type { MARQUEE_DEFAULT_PROPS } from '../constants/marquee-default-props.constant'

export type IMarqueeProps = {
  /**
   * Animation duration
   */
  duration?: string

  /**
   * Gap between repeated content tracks
   */
  gap?: string

  /**
   * Pause animation when hovering the marquee
   */
  pauseOnHover?: boolean

  /**
   * Number of repeated content tracks
   */
  repeat?: number

  /**
   * Reverse animation direction
   */
  reverse?: boolean

  /**
   * Scroll vertically instead of horizontally
   */
  vertical?: boolean

  /**
   * Visual configuration
   */
  ui?: {
    /**
     * Class to apply to the container
     */
    containerClass?: (payload: {
      defaults: ReturnType<typeof MARQUEE_DEFAULT_PROPS['ui']['containerClass']>
    }) => ClassType

    /**
     * Style to apply to the container
     */
    containerStyle?: () => CSSProperties

    /**
     * Class to apply to each repeated track
     */
    contentClass?: (payload: {
      defaults: ReturnType<typeof MARQUEE_DEFAULT_PROPS['ui']['contentClass']>
      pauseOnHover: boolean
      vertical: boolean
    }) => ClassType

    /**
     * Style to apply to each repeated track
     */
    contentStyle?: (payload: {
      reverse: boolean
    }) => CSSProperties
  }
}

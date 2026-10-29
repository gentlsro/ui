import type { UIClassPicker, UIResolvedClasses } from '../../../types/ui-class-config.type'
import type { CSSProperties } from 'vue'

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
      defaults: UIClassPicker<UIResolvedClasses['marquee']['containerClass']>
    }) => ClassType

    /**
     * Style to apply to the container
     */
    containerStyle?: () => CSSProperties

    /**
     * Class to apply to each repeated track
     */
    contentClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['marquee']['contentClass']>
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

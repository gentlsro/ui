import type { CSSProperties } from 'vue'

// Constants
import type { SKELETON_DEFAULT_PROPS } from '../constants/skeleton-default-props.constant'

export type ISkeletonProps = {
  /**
   * The speed with which the animation will run
   */
  animationSpeed?: number

  /**
   * Variant of the skeleton
   */
  variant?: 'wave' | 'pulse' | 'blink'

  /**
   * Visual configuration
   */
  ui?: {
    /**
     * Class to apply to the container
     */
    containerClass?: (payload: {
      defaults: ReturnType<typeof SKELETON_DEFAULT_PROPS['ui']['containerClass']>
    }) => ClassType

    /**
     * Style to apply to the container
     */
    containerStyle?: () => CSSProperties
  }
}

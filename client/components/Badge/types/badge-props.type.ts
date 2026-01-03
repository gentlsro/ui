import type { CSSProperties } from 'vue'

// Constants
import type { BADGE_DEFAULT_PROPS } from '../constants/badge-default-props.constant'

export type IBadgeProps = {
  /**
   * The counter of the badge
   */
  counter?: number | string

  /**
   * Visual configuration
   */
  ui?: {
    /**
     * Class to apply to the badge
     */
    containerClass?: (payload: {
      defaults: ReturnType<typeof BADGE_DEFAULT_PROPS['ui']['containerClass']>
    }) => ClassType

    /**
     * Style to apply to the container
     */
    containerStyle?: () => CSSProperties
  }
}

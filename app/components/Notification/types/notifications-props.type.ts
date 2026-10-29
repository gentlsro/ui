import type { CSSProperties } from 'vue'

// Constants
import type { NOTIFICATIONS_DEFAULT_PROPS } from '../constants/notifications-default-props.constant'

export type INotificationsProps = {
  /**
   * Placement of the notifications container
   */
  placement?:
    | 'top-left'
    | 'top'
    | 'top-right'
    | 'left'
    | 'right'
    | 'bottom-left'
    | 'bottom'
    | 'bottom-right'

  /**
   * Visual configuration
   */
  ui?: {
    /**
     * Class to apply to the container
     */
    containerClass?: (payload: {
      defaults: ReturnType<typeof NOTIFICATIONS_DEFAULT_PROPS['ui']['containerClass']>
    }) => ClassType

    /**
     * Style to apply to the container
     */
    containerStyle?: () => CSSProperties
  }
}

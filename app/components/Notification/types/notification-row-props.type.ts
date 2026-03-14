import type { CSSProperties } from 'vue'

// Types
import type { INotification } from './notification.type'

// Constants
import type { NOTIFICATION_ROW_DEFAULT_PROPS } from '../constants/notification-row-default-props.constant'

export type INotificationRowProps = {
  /**
   * The notification data to display
   */
  notification: INotification

  /**
   * Whether the close button is hidden
   */
  noClose?: boolean

  /**
   * Visual configuration
   */
  ui?: {
    /**
     * Class to apply to the container
     */
    containerClass?: (payload: {
      defaults: ReturnType<typeof NOTIFICATION_ROW_DEFAULT_PROPS['ui']['containerClass']>
    }) => ClassType

    /**
     * Style to apply to the container
     */
    containerStyle?: () => CSSProperties

    /**
     * Class to apply to the title row wrapper
     */
    titleRowClass?: (payload: {
      defaults: ReturnType<typeof NOTIFICATION_ROW_DEFAULT_PROPS['ui']['titleRowClass']>
    }) => ClassType

    /**
     * Style to apply to the title row wrapper
     */
    titleRowStyle?: () => CSSProperties

    /**
     * Class to apply to the icon
     */
    iconClass?: (payload: {
      defaults: ReturnType<typeof NOTIFICATION_ROW_DEFAULT_PROPS['ui']['iconClass']>
    }) => ClassType

    /**
     * Style to apply to the icon
     */
    iconStyle?: () => CSSProperties

    /**
     * Class to apply to the title wrapper
     */
    titleClass?: (payload: {
      defaults: ReturnType<typeof NOTIFICATION_ROW_DEFAULT_PROPS['ui']['titleClass']>
    }) => ClassType

    /**
     * Style to apply to the title wrapper
     */
    titleStyle?: () => CSSProperties

    /**
     * Class to apply to the title text
     */
    titleTextClass?: (payload: {
      defaults: ReturnType<typeof NOTIFICATION_ROW_DEFAULT_PROPS['ui']['titleTextClass']>
    }) => ClassType

    /**
     * Style to apply to the title text
     */
    titleTextStyle?: () => CSSProperties

    /**
     * Class to apply to the subtitle list
     */
    subtitleClass?: (payload: {
      defaults: ReturnType<typeof NOTIFICATION_ROW_DEFAULT_PROPS['ui']['subtitleClass']>
    }) => ClassType

    /**
     * Style to apply to the subtitle list
     */
    subtitleStyle?: () => CSSProperties

    /**
     * Class to apply to the subtitle list items
     */
    subtitleItemClass?: (payload: {
      defaults: ReturnType<typeof NOTIFICATION_ROW_DEFAULT_PROPS['ui']['subtitleItemClass']>
    }) => ClassType

    /**
     * Style to apply to the subtitle list items
     */
    subtitleItemStyle?: () => CSSProperties

    /**
     * Class to apply to the counter badge
     */
    counterClass?: (payload: {
      defaults: ReturnType<typeof NOTIFICATION_ROW_DEFAULT_PROPS['ui']['counterClass']>
    }) => ClassType

    /**
     * Style to apply to the counter badge
     */
    counterStyle?: () => CSSProperties
  }
}

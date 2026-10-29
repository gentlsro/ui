import type { UIClassPicker, UIResolvedClasses } from '../../../types/ui-class-config.type'
import type { CSSProperties } from 'vue'

// Types
import type { INotification } from './notification.type'

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
      defaults: UIClassPicker<UIResolvedClasses['notificationRow']['containerClass']>
    }) => ClassType

    /**
     * Style to apply to the container
     */
    containerStyle?: () => CSSProperties

    /**
     * Class to apply to the title row wrapper
     */
    titleRowClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['notificationRow']['titleRowClass']>
    }) => ClassType

    /**
     * Style to apply to the title row wrapper
     */
    titleRowStyle?: () => CSSProperties

    /**
     * Class to apply to the icon
     */
    iconClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['notificationRow']['iconClass']>
    }) => ClassType

    /**
     * Style to apply to the icon
     */
    iconStyle?: () => CSSProperties

    /**
     * Class to apply to the title wrapper
     */
    titleClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['notificationRow']['titleClass']>
    }) => ClassType

    /**
     * Style to apply to the title wrapper
     */
    titleStyle?: () => CSSProperties

    /**
     * Class to apply to the title text
     */
    titleTextClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['notificationRow']['titleTextClass']>
    }) => ClassType

    /**
     * Style to apply to the title text
     */
    titleTextStyle?: () => CSSProperties

    /**
     * Class to apply to the subtitle list
     */
    subtitleClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['notificationRow']['subtitleClass']>
    }) => ClassType

    /**
     * Style to apply to the subtitle list
     */
    subtitleStyle?: () => CSSProperties

    /**
     * Class to apply to the subtitle list items
     */
    subtitleItemClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['notificationRow']['subtitleItemClass']>
    }) => ClassType

    /**
     * Style to apply to the subtitle list items
     */
    subtitleItemStyle?: () => CSSProperties

    /**
     * Class to apply to the counter badge
     */
    counterClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['notificationRow']['counterClass']>
    }) => ClassType

    /**
     * Style to apply to the counter badge
     */
    counterStyle?: () => CSSProperties
  }
}

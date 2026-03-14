// Types
import type { INotification } from '../types/notification.type'

// Store
import { useNotificationStore } from '../stores/notification.store'

export type INotifyPayload = {
  title: string
  type?: INotification['type']
  timeout?: number
  subtitle?: string | string[]
  componentBelow?: INotification['componentBelow']
  removeNotificationsAfterSuccess?: boolean
}

export function notify(notifyPayload: INotifyPayload) {
  const {
    timeout = 3000,
    title,
    type = 'info',
    subtitle,
    componentBelow,
    removeNotificationsAfterSuccess = false,
  } = notifyPayload || {}

  const { addNotification, removeAllNotifications } = useNotificationStore()

  if (type === 'positive' && removeNotificationsAfterSuccess) {
    removeAllNotifications()
  }

  return addNotification({
    title,
    subtitle,
    type,
    timeout,
    componentBelow,
  })
}

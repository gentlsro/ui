// Types
import type { INotification } from '../types/notification.type'

// Store
import { useNotificationStore } from '../stores/notification.store'

export function notify(
  title: string,
  type: INotification['type'] = 'info',
  options?: {
    timeout?: number
    subtitle?: string | string[]
    componentBelow?: INotification['componentBelow']
    removeNotificationsAfterSuccess?: boolean
  },
) {
  const {
    timeout = 3000,
    subtitle,
    componentBelow,
    removeNotificationsAfterSuccess = false,
  } = options || {}

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

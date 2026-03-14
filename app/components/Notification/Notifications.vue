<script setup lang="ts">
// Types
import type { INotificationsProps } from './types/notifications-props.type'

// Constants
import { NOTIFICATIONS_DEFAULT_PROPS } from './constants/notifications-default-props.constant'

// Store
import { useNotificationStore } from './stores/notification.store'

const props = withDefaults(defineProps<INotificationsProps>(), {
  ...getComponentProps('notifications'),
})

// Utils
const mergedProps = computed(() => getComponentMergedProps('notifications', props))

// Store
const notificationStore = useNotificationStore()
const { notifications } = storeToRefs(notificationStore)

// Layout
const notificationsEl = ref<HTMLDivElement>()
const placementClass = computed(() => {
  switch (props.placement) {
    case 'top-left':
      return 'top-20 left-5'

    case 'top':
      return 'top-20 left-50% translate-x--50%'

    case 'top-right':
      return 'top-20 right-10 sm:right-20'

    case 'left':
      return 'top-50% left-5 translate-y--50%'

    case 'right':
      return 'top-50% right-5 translate-y--50%'

    case 'bottom-left':
      return 'bottom-5 left-5'

    case 'bottom':
      return 'bottom-5 left-50% translate-x--50%'

    case 'bottom-right':
      return 'bottom-5 right-5'

    default:
      return 'top-20 left-50% translate-x--50%'
  }
})

// Styles - container
const containerClass = computed(() => {
  return mergedProps.value?.ui?.containerClass?.({
    defaults: NOTIFICATIONS_DEFAULT_PROPS.ui.containerClass(),
  })
})

const containerStyle = computed(() => {
  return mergedProps.value?.ui?.containerStyle?.()
})
</script>

<template>
  <TransitionGroup
    ref="notificationsEl"
    name="list"
    tag="div"
    class="notifications"
    :class="[placementClass, containerClass]"
    :style="containerStyle"
    .hide="notificationStore.removeAllNotifications"
  >
    <NotificationRow
      v-for="notification in notifications"
      :key="notification.id"
      :notification
      @hide="notificationStore.removeNotification(notification.id)"
    />
  </TransitionGroup>
</template>

<style lang="scss">
.list-move, /* apply transition to moving elements */
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(-100%);
}
</style>

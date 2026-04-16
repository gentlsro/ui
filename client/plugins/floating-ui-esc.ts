import { blurAnyFocusedInput } from '$utils'

export default defineNuxtPlugin(() => {
  // Hide last floating element on ESC
  onKeyStroke('Escape', () => {
    const uiStore = useUIStore()

    const lastFloatingElement = Array.from(document.body.children).toReversed().find(child => child.classList.contains('floating-element')) as HTMLElement
    const notificationsElement = document.querySelector('.notifications')
    const hasOngoingNotifications = document.querySelector('.notification-row')
    const isActiveElementInput = uiStore.isActiveElementInput()

    // Blur any focused element to potentially trigger a blur event on them
    blurAnyFocusedInput()

    if (lastFloatingElement && !hasOngoingNotifications) {
    // @ts-expect-error DOM
      lastFloatingElement.hide(!isActiveElementInput)
    }

    if (notificationsElement) {
    // @ts-expect-error DOM
      notificationsElement.hide()
    }
  })
})

export default defineNuxtPlugin(() => {
  // Hide last floating element on ESC
  onKeyStroke('Escape', () => {
    const lastFloatingElement = document.querySelector(
      '.floating-element:last-child',
    )
    const notificationsElement = document.querySelector('.notifications')
    const hasOngoingNotifications = document.querySelector('.notification-row')

    if (lastFloatingElement && !hasOngoingNotifications) {
    // @ts-expect-error DOM
      lastFloatingElement.hide(false)
    }

    if (notificationsElement) {
    // @ts-expect-error DOM
      notificationsElement.hide()
    }
  })
})

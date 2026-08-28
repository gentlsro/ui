import { blurFocusedInput } from '#layers/utilities/app/utils/blur-focused-input'
import { isActiveElementInput } from '../utils/is-active-element-input'

export default defineNuxtPlugin(() => {
  // Hide last floating element on ESC
  onKeyStroke('Escape', () => {
    const lastFloatingElement = Array.from(document.body.children).toReversed().find(child => child.classList.contains('floating-element')) as HTMLElement
    const notificationsElement = document.querySelector('.notifications')
    const hasOngoingNotifications = document.querySelector('.notification-row')
    const activeElementIsInput = isActiveElementInput()

    // Blur any focused element to potentially trigger a blur event on them
    blurFocusedInput()

    if (lastFloatingElement && !hasOngoingNotifications) {
    // @ts-expect-error DOM
      lastFloatingElement.hide(!activeElementIsInput)
    }

    if (notificationsElement) {
    // @ts-expect-error DOM
      notificationsElement.hide()
    }
  })
})

import { blurFocusedInput } from '#layers/utilities/app/utils/blur-focused-input'

type Hideable = Element & { hide?: (force?: boolean) => void }

export default defineNuxtPlugin(() => {
  // Hide last floating element on ESC
  onKeyStroke('Escape', () => {
    const uiStore = useUIStore()

    // Only menus and dialogs can be hidden; other floating elements (like a docked
    // toolbar teleported to the body) can come after them and are skipped
    const lastFloatingElement = Array.from(document.body.children)
      .toReversed()
      .find((child: Hideable) => {
        return child.classList.contains('floating-element') && typeof child.hide === 'function'
      }) as Hideable | undefined

    const notificationsElement = document.querySelector('.notifications') as Hideable | null
    const hasOngoingNotifications = document.querySelector('.notification-row')
    const isActiveElementInput = uiStore.isActiveElementInput()

    // Blur any focused element to potentially trigger a blur event on them
    blurFocusedInput()

    if (lastFloatingElement && !hasOngoingNotifications) {
      lastFloatingElement.hide?.(!isActiveElementInput)
    }

    notificationsElement?.hide?.()
  })
})

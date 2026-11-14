import { listenToRipples } from '../directives/ripple.directive'

// (elements that never hydrate ripple too: the listener does not wait for a directive to mount)
export default defineNuxtPlugin(() => {
  listenToRipples()
})

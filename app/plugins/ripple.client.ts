import { listenToRipples } from '../directives/ripple.directive'

// The one place the ripple listener starts (elements that never hydrate ripple too: it does not wait for a directive)
export default defineNuxtPlugin(nuxtApp => {
  nuxtApp.vueApp.onUnmount(listenToRipples())
})

import { createTooltipHost, tooltipHostKey } from '../components/Tooltip/composables/useTooltipHost'

export default defineNuxtPlugin(nuxtApp => {
  // Per-app state: never share DOM owners or timers between SSR requests.
  const host = createTooltipHost()

  nuxtApp.vueApp.provide(tooltipHostKey, host)
  nuxtApp.vueApp.onUnmount(host.dispose)
})

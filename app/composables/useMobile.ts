// Constants
import { $bp } from '../constants/breakpoints'

export function useMobile() {
  // Breakpoint getters create a media-query watcher. Own it during setup,
  // rather than creating an unowned watcher when the computed first runs.
  const pageViewport = $bp.page
  const { isMobile: isMobileDevice } = useDevice()

  const isMobile = computed(() => {
    return import.meta.client ? !pageViewport.value : isMobileDevice
  })

  return { isMobile }
}

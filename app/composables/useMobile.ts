// Constants
import { $bp } from '../../shared/constants/breakpoints'

export function useMobile() {
  const { isMobile: isMobileDevice } = useDevice()

  const isMobile = computed(() => {
    return import.meta.client ? !$bp.page.value : isMobileDevice
  })

  return { isMobile }
}

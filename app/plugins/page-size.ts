export default defineNuxtPlugin(() => {
  const { isActiveElementInput } = useUIStore()

  if (!import.meta.client) {
    return
  }

  const { isMobile } = useDevice()

  const setSize = (w: number, h: number) => {
    document.documentElement.style.setProperty('--page-width', `${w}px`)
    document.documentElement.style.setProperty('--page-height', `${h}px`)
  }

  const setViewportSize = () => {
    if (isActiveElementInput() && isMobile) {
      return
    }

    setSize(window.innerWidth, window.innerHeight)
  }

  setViewportSize()
  useEventListener(window, 'resize', setViewportSize)
})

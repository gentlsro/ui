export default defineNuxtPlugin(() => {
  const { isActiveElementInput } = useUIStore()

  if (!import.meta.client) {
    return
  }

  // Set immediately to avoid hydration jump (SSR uses 100vh fallback, then client overwrites)
  const setSize = (w: number, h: number) => {
    document.documentElement.style.setProperty('--page-width', `${w}px`)
    document.documentElement.style.setProperty('--page-height', `${h}px`)
  }

  setSize(document.documentElement.clientWidth, document.documentElement.clientHeight)

  const { width, height } = useElementSize(document.documentElement)
  const { isMobile } = useDevice()

  watch([width, height], () => {
    if (isActiveElementInput() && isMobile) {
      return
    }
    if (width.value > 0 && height.value > 0) {
      setSize(width.value, height.value)
    }
  }, { immediate: true })
})

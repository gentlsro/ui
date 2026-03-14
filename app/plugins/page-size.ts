export default defineNuxtPlugin(() => {
  const { isActiveElementInput } = useUIStore()

  if (!import.meta.client) {
    return
  }

  const { width, height } = useElementSize(document.documentElement)
  const { isMobile } = useDevice()

  watch([width, height], () => {
    if (isActiveElementInput() && isMobile) {
      return
    }

    document.documentElement.style.setProperty('--page-width', `${width.value}px`)
    document.documentElement.style.setProperty('--page-height', `${height.value}px`)
  }, { immediate: true })
})

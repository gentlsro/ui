export default defineNuxtPlugin(() => {
  const { isActiveElementInput } = useUIStore()
  const { width, height } = useElementSize(document.documentElement)

  watch([width, height], () => {
    if (isActiveElementInput()) {
      return
    }

    document.documentElement.style.setProperty('--page-width', `${width.value}px`)
    document.documentElement.style.setProperty('--page-height', `${height.value}px`)
  }, { immediate: true })
})

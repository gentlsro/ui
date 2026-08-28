import { isActiveElementInput } from '../utils/is-active-element-input'

export default defineNuxtPlugin(() => {
  if (!import.meta.client) {
    return
  }

  const { viewportWidthCookie, viewportHeightCookie } = useViewport()
  const { isMobile } = useDevice()

  const setSize = (w: number, h: number) => {
    document.documentElement.style.setProperty('--page-width', `${w}px`)
    document.documentElement.style.setProperty('--page-height', `${h}px`)

    viewportWidthCookie.value = w
    viewportHeightCookie.value = h
  }

  const setViewportSize = () => {
    if (isActiveElementInput() && isMobile) {
      return
    }

    setSize(window.innerWidth, window.innerHeight)
  }

  // `dvh` / `keyboard-inset-*` do not shrink for the iOS virtual keyboard.
  // `visualViewport` does, so keep a CSS copy for overlays and pickers.
  const setVisualViewportSize = () => {
    const visualViewport = window.visualViewport
    const root = document.documentElement

    root.style.setProperty(
      '--visual-viewport-height',
      `${visualViewport?.height ?? window.innerHeight}px`,
    )
    root.style.setProperty(
      '--visual-viewport-width',
      `${visualViewport?.width ?? window.innerWidth}px`,
    )
    root.style.setProperty(
      '--visual-viewport-offset-top',
      `${visualViewport?.offsetTop ?? 0}px`,
    )
    root.style.setProperty(
      '--visual-viewport-offset-left',
      `${visualViewport?.offsetLeft ?? 0}px`,
    )
  }

  setViewportSize()
  setVisualViewportSize()
  useEventListener(window, 'resize', setViewportSize)
  useEventListener(window, 'resize', setVisualViewportSize)
  useEventListener(window.visualViewport, 'resize', setVisualViewportSize)
  useEventListener(window.visualViewport, 'scroll', setVisualViewportSize)
})

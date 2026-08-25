function parseViewportDimension(value: unknown): number | undefined {
  const size = typeof value === 'number'
    ? value
    : Number.parseFloat(String(value ?? ''))

  if (!Number.isFinite(size) || size <= 0) {
    return
  }

  return Math.round(size)
}

const DEVICE_VIEWPORT_BY_CLASS = {
  mobile: { width: 400, height: 844 },
  tablet: { width: 800, height: 1024 },
  desktop: { width: 1536, height: 1080 },
} as const

type IViewportGuess = {
  width: number
  height: number
}

export function useViewport() {
  const viewportWidthCookie = useCookie<number | undefined>('screen_size', {
    decode: value => parseViewportDimension(value),
    encode: value => (value == null ? '' : String(value)),
  })
  const viewportHeightCookie = useCookie<number | undefined>('screen_height', {
    decode: value => parseViewportDimension(value),
    encode: value => (value == null ? '' : String(value)),
  })

  const headers = useRequestHeaders([
    'sec-ch-viewport-width',
    'viewport-width',
    'sec-ch-viewport-height',
    'viewport-height',
  ])
  const { isMobile, isTablet } = useDevice()

  const clientHintWidth = parseViewportDimension(headers['sec-ch-viewport-width'])
    ?? parseViewportDimension(headers['viewport-width'])
  const clientHintHeight = parseViewportDimension(headers['sec-ch-viewport-height'])
    ?? parseViewportDimension(headers['viewport-height'])

  function getDeviceViewportGuess(): IViewportGuess {
    if (isMobile) {
      return DEVICE_VIEWPORT_BY_CLASS.mobile
    }

    if (isTablet) {
      return DEVICE_VIEWPORT_BY_CLASS.tablet
    }

    return DEVICE_VIEWPORT_BY_CLASS.desktop
  }

  const guessed = useState<IViewportGuess>('ui-viewport', () => {
    const deviceGuess = getDeviceViewportGuess()

    return {
      width: clientHintWidth
        ?? parseViewportDimension(viewportWidthCookie.value)
        ?? deviceGuess.width,

      height: clientHintHeight
        ?? parseViewportDimension(viewportHeightCookie.value)
        ?? deviceGuess.height,
    }
  })

  if (clientHintWidth) {
    viewportWidthCookie.value = clientHintWidth
  }

  if (clientHintHeight) {
    viewportHeightCookie.value = clientHintHeight
  }

  onMounted(() => {
    const width = parseViewportDimension(window.innerWidth)
    const height = parseViewportDimension(window.innerHeight)

    if (width) {
      viewportWidthCookie.value = width
    }

    if (height) {
      viewportHeightCookie.value = height
    }

    if (width || height) {
      guessed.value = {
        width: width ?? guessed.value.width,
        height: height ?? guessed.value.height,
      }
    }
  })

  const width = computed(() => guessed.value.width)
  const height = computed(() => guessed.value.height)

  return {
    viewportHeightCookie,
    viewportWidthCookie,

    width,
    height,
  }
}

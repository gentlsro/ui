function parseViewportDimension(value: unknown): number | undefined {
  const size = typeof value === 'number'
    ? value
    : Number.parseFloat(String(value ?? ''))

  if (!Number.isFinite(size) || size <= 0) {
    return
  }

  return Math.round(size)
}

const FALLBACK_WIDTH = 1280
const FALLBACK_HEIGHT = 800

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

  const clientHintWidth = parseViewportDimension(headers['sec-ch-viewport-width'])
    ?? parseViewportDimension(headers['viewport-width'])
  const clientHintHeight = parseViewportDimension(headers['sec-ch-viewport-height'])
    ?? parseViewportDimension(headers['viewport-height'])

  const guessed = computed(() => ({
    width: import.meta.client
      ? parseViewportDimension(viewportWidthCookie.value) ?? FALLBACK_WIDTH
      : clientHintWidth ?? parseViewportDimension(viewportWidthCookie.value) ?? FALLBACK_WIDTH,

    height: import.meta.client
      ? parseViewportDimension(viewportHeightCookie.value) ?? FALLBACK_HEIGHT
      : clientHintHeight ?? parseViewportDimension(viewportHeightCookie.value) ?? FALLBACK_HEIGHT,
  }))

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
  })

  console.log('🚀 ~ useViewport', {
    side: import.meta.server ? 'server' : 'client',
    width: guessed.value.width,
    height: guessed.value.height,
    candidates: {
      clientHintWidth,
      clientHintHeight,
      viewportWidthCookie: viewportWidthCookie.value,
      viewportHeightCookie: viewportHeightCookie.value,
    },
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

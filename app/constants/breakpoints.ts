import { useBreakpoints } from '@vueuse/core'

// Breakpoints
export const BREAKPOINTS = Object.freeze({
  'xs': 360,
  'xm': 480,
  'sm': 640,
  'md': 768,
  'lg': 1024,
  'xl': 1280,
  '2xl': 1536,
  '3xl': 1920,
  '4xl': 2560,

  'page': 1280,
  'inf': 9999,
})

export const BREAKPOINTS_PX = Object.entries(BREAKPOINTS)
  .reduce<Record<string, string>>((agg, [key, value]) => {
    agg[key] = `${value}px`

    return agg
  }, {} as Record<string, string>)

export const $bp = useBreakpoints(BREAKPOINTS)

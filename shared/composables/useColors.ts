import type { Color } from 'invert-color'
import invert from 'invert-color'

// Constants
import colors from '../constants/colors.json'

function addColorsToMap(obj: Record<string, unknown>, path: string[], map: Map<string, string>) {
  for (const [k, v] of Object.entries(obj)) {
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      addColorsToMap(v as Record<string, unknown>, [...path, k], map)
    } else if (typeof v === 'string' && !map.has(v)) {
      map.set(v, [...path, k].join('-'))
    }
  }
}

// export const paletteHexToTwName = new Map<string, string>()

// addColorsToMap(colors as Record<string, unknown>, [], paletteHexToTwName)

let paletteHexToTwName: Map<string, string> | undefined

function getPaletteHexToTwName() {
  if (!paletteHexToTwName) {
    paletteHexToTwName = new Map()
    addColorsToMap(colors, [], paletteHexToTwName)
  }
  return paletteHexToTwName
}

addColorsToMap(colors as Record<string, unknown>, [], getPaletteHexToTwName())

export function useColors() {
  function invertColor(color: Color) {
    try {
      return invert(color, { black: '#000000', white: '#ffffff', threshold: 0.5 })
    } catch (error) {
      return color
    }
  }

  function isHex(color: string) {
    return /^#(?:[0-9a-f]{3}){1,2}$/i.test(color)
  }

  function isRgba(color: string) {
    return /^rgba?\(\d+,\s*\d+,\s*\d+(?:,\s*\d+(?:\.\d+)?)?\)$/.test(color)
  }

  /**
   * Converts rgba color to hex
   */
  function rgbaToHex(rgba: string, includeAlpha = false) {
    const [r = 0, g = 0, b = 0, a = 1] = rgba.match(/\d+(\.\d+)?/g)!.map((num, index) => index === 3
      ? Number.parseFloat(num)
      : Number(num))

    const hexR = r.toString(16).padStart(2, '0')
    const hexG = g.toString(16).padStart(2, '0')
    const hexB = b.toString(16).padStart(2, '0')
    const hexA = Math.round(a * 255).toString(16).padStart(2, '0')

    return includeAlpha
      ? `#${hexR}${hexG}${hexB}${hexA}`
      : `#${hexR}${hexG}${hexB}`
  }

  /**
   * Convert hex color to rgba
   */
  function hexToRgb(hex: string, alpha?: number) {
    hex = hex.replace('#', '')

    const r = Number.parseInt(hex.substring(0, 2), 16)
    const g = Number.parseInt(hex.substring(2, 4), 16)
    const b = Number.parseInt(hex.substring(4, 6), 16)

    alpha = Math.min(Math.max(alpha ?? 1, 0), 1)

    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  /**
   * Gets rgba color from theme colors (for example 'blue.500')
   */
  function getColor(colorPath: string, alpha?: number, returnHex?: boolean) {
    const hexColor = get(colors, colorPath)

    if (returnHex) {
      return hexColor
    }

    if (
      !hexColor
      || typeof hexColor !== 'string'
      || !hexColor.startsWith('#')
    ) {
      return undefined
    }

    alpha = Math.min(Math.max(alpha ?? 1, 0), 1)

    const r = Number.parseInt(hexColor.substring(1, 3), 16)
    const g = Number.parseInt(hexColor.substring(3, 5), 16)
    const b = Number.parseInt(hexColor.substring(5, 7), 16)

    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  /**
   * Creates CSS out of the [IStyle] object
   */
  function resolveStyle(
    style?: IItem | null,

    // When true, in case we get a `complex` style and no `icon` property, we
    // add fallback for the `backgroundColor` -> `style.color`
    fillMissingIcon?: boolean,
  ): IItem {
    if (!style) {
      return {}
    }

    if (style.isComplex) {
      return {
        backgroundColor: (style.icon || !fillMissingIcon)
          ? style.backgroundColor
          : (style.backgroundColor ?? style.color),
        color: style.color,
        icon: style.icon,
        border: style.borderColor ? `1px solid ${style.borderColor}` : undefined,
        isComplex: true,
      }
    } else {
      const hexColor = isRgba(style.color) ? rgbaToHex(style.color) : style.color

      return {
        backgroundColor: style.color,
        color: style.color ? invertColor(hexColor) : undefined,
        icon: style.icon,
      }
    }
  }

  /**
   * Gets color from colors.json or falls back to they provided color
   */
  function resolveColor(color: string) {
    return get(colors, color) ?? color
  }

  function getTwNameFromHex(hex: string) {
    // return paletteHexToTwName.get(hex)
    return getPaletteHexToTwName().get(hex)
  }

  return {
    invertColor,
    hexToRgb,
    rgbaToHex,
    getColor,
    resolveStyle,
    isHex,
    isRgba,
    resolveColor,
    getTwNameFromHex,
  }
}

import { toEscapedSelector } from 'unocss'
import type { Preset } from 'unocss'

/**
 * Brand and status colours backed by CSS variables: `rgb(var(--color-<name>-rgb, <default channels>))`, so a scope
 * (a DynamicGrid's UI theme) can set `--color-<name>-rgb` and keep opacity modifiers (`bg-primary/10`). The presets
 * still declare them as hex (the `colors.json` the UI layer writes keeps hex for `useColors().getColor()`); the
 * resolved theme gets the variable form, its default the last preset's hex
 */
export const CSS_VARIABLE_COLORS = ['primary', 'secondary', 'tertiary', 'positive', 'negative', 'warning', 'info'] as const

/**
 * Tokens a scope may set, unset by default: each usage keeps its own colour as the fallback, so nothing changes where
 * no scope sets them. `<token>` is the light fallback, `<token>-dark` the dark one (the `bg-ca`, `border-ca`,
 * `color-ca` and `bg-surface` shortcuts pick them by theme)
 */
const UI_TOKEN_COLORS = {
  'surface': 'rgb(var(--color-surface-rgb, 255 255 255))',
  'surface-dark': 'rgb(var(--color-surface-rgb, 0 0 0))',
  'surface-muted': 'rgb(var(--color-surface-muted-rgb, 245 245 245))',
  'surface-muted-dark': 'rgb(var(--color-surface-muted-rgb, 38 38 38))',
  'border': 'rgb(var(--color-border-rgb, 212 212 212))',
  'border-dark': 'rgb(var(--color-border-rgb, 82 82 82))',
  'text-muted': 'rgb(var(--color-text-muted-rgb, 82 82 82))',
  'text-muted-dark': 'rgb(var(--color-text-muted-rgb, 163 163 163))',
}

/** The border radius `rounded-custom` and the inputs take: a scope sets `--radius-custom` */
export const CUSTOM_RADIUS = 'var(--radius-custom,0.5rem)'

function hexToChannels(hex: string) {
  const digits = hex.slice(1)
  const full = digits.length <= 4 ? [...digits].map(digit => digit + digit).join('') : digits

  return [0, 2, 4].map(at => Number.parseInt(full.slice(at, at + 2), 16)).join(' ')
}

const HEX_COLOR = /^#(?:[\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/i

export function gentlUIPreset(): Preset {
  const fontSize = 16
  const borderWidth = 1

  return {
    name: '@unocss/gentl-ui',
    theme: {
      colors: {
        primary: '#075985',
        secondary: '#B6006B',
        tertiary: '#6BB600',
        darker: '#121212',
        positive: '#95CD41',
        negative: '#FC4F4F',
        warning: '#FB923C',
        info: '#60A5FA',
      },
      boxShadow: {
        consistent: '0px 0px 12px 8px rgba(0, 0, 0, 0.05)',
      },
      font: {
        size: {
          '2xs': '0.625rem',
          'xs': '0.75rem',
          'sm': '0.875rem',
          'md': '1rem',
          'lg': '1.125rem',
          'xl': '1.25rem',
          '2xl': '1.5rem',
        },
        weight: {
          thin: '100',
          extralight: '200',
          light: '300',
          normal: '400',
          medium: '500',
          semibold: '600',
          bold: '700',
          extrabold: '800',
          black: '900',
        },
      },
    },
    // (on the theme every preset merged into, so the brand colours' defaults are the last preset's: Platform's)
    extendTheme: theme => {
      const colors = ((theme as { colors?: Record<string, unknown> }).colors ??= {})

      for (const name of CSS_VARIABLE_COLORS) {
        const value = colors[name]

        if (typeof value === 'string' && HEX_COLOR.test(value)) {
          colors[name] = `rgb(var(--color-${name}-rgb, ${hexToChannels(value)}))`
        }
      }

      // (the text on a brand fill: white unless a scope sets it; keep any keys a consumer already defined)
      const existingOn = typeof colors.on === 'object' && colors.on !== null ? colors.on : undefined
      const existingUi = typeof colors.ui === 'object' && colors.ui !== null ? colors.ui : undefined

      colors.on = {
        primary: 'rgb(var(--color-on-primary-rgb, 255 255 255))',
        secondary: 'rgb(var(--color-on-secondary-rgb, 255 255 255))',
        ...existingOn,
      }
      colors.ui = {
        ...UI_TOKEN_COLORS,
        ...existingUi,
      }
    },
    blocklist: [
      /^ps/, // blocks all ps-* utilities
    ],
    rules: [
      [/^ps/, () => ({})], // matches ps-* but generates nothing
      [/^font-rem-(\d+)$/, ([, d]) => ({ 'font-size': `${+(d ?? 0) / fontSize}rem` })],
      ['flex-grow-max', { flex: '10000 1 0%' }],
      ['text-last-center', { 'text-align-last': 'center' }],
      [
        /^(hide-scrollbar)$/,
        (_, { rawSelector }) => {
          const selector = toEscapedSelector(rawSelector)

          return `
          ${selector} {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }

          ${selector}::-webkit-scrollbar {
            display: none;
          }
        `
        },
      ],
      [
        /^(reset-autofill)$/,
        (_, { rawSelector }) => {
          const selector = toEscapedSelector(rawSelector)

          return `
          ${selector} input:-webkit-autofill,
          ${selector} input:-webkit-autofill:hover,
          ${selector} input:-webkit-autofill:focus,
          ${selector} input:-webkit-autofill:active,
          ${selector}.control:-webkit-autofill,
          ${selector}.control:-webkit-autofill:hover,
          ${selector}.control:-webkit-autofill:focus,
          ${selector}.control:-webkit-autofill:active {
            -webkit-text-fill-color: #111827 !important;
            color: #111827 !important;
            caret-color: #111827 !important;
            font-family: inherit !important;
            font-size: var(--fontSize) !important;
            line-height: var(--lineHeight) !important;
            padding: var(--padding) !important;
            margin: var(--margin) !important;
            -webkit-box-shadow: 0 0 0 1000px transparent inset !important;
            box-shadow: 0 0 0 1000px transparent inset !important;
            transition: background-color 9999s ease-out 0s, color 9999s ease-out 0s;
            opacity: 1 !important;
          }

          .dark ${selector} input:-webkit-autofill,
          .dark ${selector} input:-webkit-autofill:hover,
          .dark ${selector} input:-webkit-autofill:focus,
          .dark ${selector} input:-webkit-autofill:active,
          .dark ${selector}.control:-webkit-autofill,
          .dark ${selector}.control:-webkit-autofill:hover,
          .dark ${selector}.control:-webkit-autofill:focus,
          .dark ${selector}.control:-webkit-autofill:active {
            -webkit-text-fill-color: #f5f5f5 !important;
            color: #f5f5f5 !important;
            caret-color: #f5f5f5 !important;
          }
        `
        },
      ],
      [
        /^shadow-consistent(?:-|$)(x{2}s|xs|sm|md|lg|xl|$)(?:-(fil{2})|$)(?:-(inset))?$/,
        ([_, size, fill, inset]) => {
          let shadow = fill ? '0px 0px 0px 12px' : '0px 0px 12px 8px'
          switch (size) {
            case 'xxs': {
              shadow = fill ? '0px 0px 0px 2px' : '0px 0px 2px 1px'
              break
            }
            case 'xs': {
              shadow = fill ? '0px 0px 0px 4px' : '0px 0px 4px 2px'
              break
            }
            case 'sm': {
              shadow = fill ? '0px 0px 0px 8px' : '0px 0px 8px 6px'
              break
            }
            case 'lg': {
              shadow = fill ? '0px 0px 0px 16px' : '0px 0px 16px 12px'
              break
            }
          }

          return {
            'box-shadow': `${
              inset ? 'inset ' : ''
            }${shadow} var(--un-shadow-color)`,
          }
        },
      ],
    ],
    shortcuts: [
      ['flex-center', 'items-center justify-center'],
      ['fit', 'h-full w-full'],
      ['disabled', 'dark:bg-dark-800 dark:color-true-gray-600 bg-light-300 color-true-gray-300'],
      ['shadow-consistent-fill', 'shadow-consistent-md-fill'],
      ['text-caption', 'color-ca tracking-wide text-sm'],
      ['text-subtitle', 'font-rem-12 italic color-ca leading-tight'],

      // Color adjusted (UI tokens: a scope's value, else the usage's own colour per theme)
      ['bg-ca', 'bg-ui-surface-muted dark:bg-ui-surface-muted-dark'],
      ['color-ca', 'color-ui-text-muted dark:color-ui-text-muted-dark'],
      ['outline-ca', 'outline-ui-border dark:outline-ui-border-dark'],
      ['shadow-ca', 'dark:shadow-true-gray-700/30 shadow-true-gray-300/50'],

      // Surfaces (cards, inputs, menus): white / black unless a scope sets `--color-surface-rgb`
      [
        /^(bg|border|outline|ring|from|via|to)-surface(-muted)?(\/\d+)?$/,
        ([, utility, muted = '', opacity = '']) => {
          return `${utility}-ui-surface${muted}${opacity} dark:${utility}-ui-surface${muted}-dark${opacity}`
        },
      ],

      // Border color
      ['border-ca', 'border-ui-border dark:border-ui-border-dark'],
      [
        /^(?:border|b)-([blrtxy])(?:-ca)?$/,
        ([_, d]) => {
          const pre = d ? `-${d}` : ''

          return `border${pre}-ui-border dark:border${pre}-ui-border-dark`
        },
      ],

      // Border width
      ['border-custom', `border-${borderWidth}`],
      [
        /^(?:border|b)-([blrtxy])(?:-custom)?$/,
        ([_, d]) => {
          const pre = d ? `-${d}` : ''

          return `border${pre}-${borderWidth}`
        },
      ],

      // Border radius (a scope sets `--radius-custom`)
      ['rounded-custom', `rounded-[${CUSTOM_RADIUS}]`],
      [
        /^rounded-([blrtxy])(?:-custom)?$/,
        ([_, d]) => {
          const pre = d ? `-${d}` : ''

          return `rounded${pre}-[${CUSTOM_RADIUS}]`
        },
      ],
    ],
  }
}

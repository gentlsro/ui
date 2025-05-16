import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetUno,
  toEscapedSelector,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

// Icon loader
import { FileSystemIconLoader } from '@iconify/utils/lib/loader/node-loaders'

// Breakpoints
import { BREAKPOINTS_PX } from './shared/constants/breakpoints'

const fontSize = 16
const rounding = 2
const borderWidth = 1

export default defineConfig({
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
    breakpoints: BREAKPOINTS_PX,
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
  rules: [
    [/^font-rem-(\d+)$/, ([, d]) => ({ 'font-size': `${+d! / fontSize}rem` })],
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

        const insetString = inset ? 'inset ' : ''

        return {
          'box-shadow': `${insetString} ${shadow} var(--un-shadow-color)`,
        }
      },
    ],
  ],
  shortcuts: [
    ['flex-center', 'items-center justify-center'],
    ['fit', 'h-full w-full'],
    ['g-section', 'flex flex-col gap-2 bg-white dark:bg-darker border-1 rounded-custom border-ca border-solid hover:border-dashed'],
    ['disabled', 'dark:bg-dark-800 dark:color-true-gray-600 bg-light-300 color-true-gray-300'],
    ['shadow-consistent-fill', 'shadow-consistent-md-fill'],
    ['text-caption', 'color-ca tracking-wide text-sm'],
    ['text-subtitle', 'font-rem-12 italic color-ca leading-tight'],

    // Color adjusted
    ['bg-ca', 'dark:bg-true-gray-800 bg-true-gray-100'],
    ['color-ca', 'dark:color-true-gray-400 color-true-gray-600'],
    ['outline-ca', 'dark:outline-true-gray-600 outline-true-gray-300'],
    ['shadow-ca', 'dark:shadow-true-gray-700/30 shadow-true-gray-300/50'],

    // Border color
    ['border-ca', 'dark:border-true-gray-600 border-true-gray-300'],
    [
      /^(?:border|b)-([blrtxy])(?:-ca)?$/,
      ([_, d]) => {
        const pre = d ? `-${d}` : ''
        return `dark:border${pre}-true-gray-600 border${pre}-true-gray-300`
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

    // Border radius
    ['rounded-custom', `rounded-${rounding}`],
    [
      /^rounded-([blrtxy])(?:-custom)?$/,
      ([_, d]) => {
        const pre = d ? `-${d}` : ''
        return `rounded${pre}-${rounding}`
      },
    ],
  ],
  presets: [
    presetUno(),
    presetIcons({
      scale: 1.2,
      collections: {
        custom: FileSystemIconLoader('./client/assets/icons', svg => {
          return svg.replace(/[\r\n]/g, '')
        }),
      },
    }),
    presetAttributify({ ignoreAttributes: ['size'] }),
    presetTypography(),
  ],
  safelist: ['color-contrast'],
  transformers: [
    transformerDirectives({ applyVariable: ['--apply', '@apply'] }),
    transformerVariantGroup(),
  ],
})

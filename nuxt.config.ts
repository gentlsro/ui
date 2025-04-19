// @unocss-include
import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'

import {
  presetAttributify,
  presetIcons,
  presetTypography,
  presetUno,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

import { createResolver } from 'nuxt/kit'

// Preset
import { gentlUIPreset } from './client/functions/unocss-preset'

const { resolve } = createResolver(import.meta.url)
const isMonorepo = import.meta.env.VITE_MONOREPO === 'true'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  extends: isMonorepo
    ? [['../Utilities']]
    : [['github:gentlsro/Utilities#master']],

  // Modules https://nuxt.com/docs/api/configuration/nuxt-config#modules
  modules: [
    resolve('./modules/ui.module'),
    '@vueuse/nuxt',
    '@unocss/nuxt',
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
    '@nuxtjs/i18n',
    '@nuxtjs/device',
    'nuxt-lodash',
  ],

  // SSR https://nuxt.com/docs/api/configuration/nuxt-config#ssr
  ssr: false,

  // Components https://nuxt.com/docs/api/configuration/nuxt-config#components
  components: {
    dirs: [
      { path: './components', pathPrefix: false },
    ],
  },

  // Imports https://nuxt.com/docs/api/configuration/nuxt-config#imports
  imports: {
    imports: [
      // Client
      { name: '$hide', from: resolve('./client/functions/hide.ts') },
      { name: 'useUIStore', from: resolve('./client/stores/ui.store.ts') },
      { name: 'useLayoutStore', from: resolve('./client/stores/layout.store.ts') },
      { name: 'notify', from: resolve('./client/components/Notification/functions/useNotifications') },
      { name: 'useBreadcrumbs', from: resolve('./client/components/Breadcrumbs/functions/useBreadcrumbs') },

      // Shared
      { name: 'extendUIConfig', from: resolve('./config.ts') },

    ],
  },

  devtools: {
    enabled: isMonorepo,
  },

  app: {
    head: {
      title: 'Gentl UI',
    },
  },

  // CSS https://nuxt.com/docs/api/nuxt-config#css
  css: [
    resolve('./client/css/reset.scss'),
    resolve('./client/css/typography.scss'),
    resolve('./client/css/perfect-scrollbar.css'),
    resolve('./client/css/main.scss'),
    resolve('./client/css/breakpoints.scss'),
    resolve('./client/css/zindex.scss'),
    resolve('./client/css/ripple.scss'),
    resolve('./client/css/colors.scss'),
  ],

  // Runtime config https://nuxt.com/docs/api/configuration/nuxt-config#runtimeconfig
  runtimeConfig: {
    public: {
      COOKIE_DOMAIN: undefined as string | undefined,
    },
  },

  srcDir: 'client/',

  // Alias
  alias: {
    $ui: join(process.cwd(), 'generated', 'ui.ts'),
    $uiConfig: join(process.cwd(), 'generated', 'uiConfig.ts'),
    $uiLayer: resolve('.'),
  },

  build: {
    // No touchy or I cut fingers
    transpile: ['imask', 'vue-imask'],
  },

  // Future
  future: {
    compatibilityVersion: 4,
  },

  // Compatibility date https://nuxt.com/docs/api/configuration/nuxt-config#compatibilitydate
  compatibilityDate: '2024-12-13',

  nitro: {
    alias: {
      $ui: join(process.cwd(), 'generated', 'ui.ts'),
      $uiConfig: join(process.cwd(), 'generated', 'uiConfig.ts'),
    },
  },

  // Typescript https://nuxt.com/docs/api/configuration/nuxt-config#typescript
  typescript: {
    tsConfig: {
      compilerOptions: {
        paths: {
          $ui: [join(process.cwd(), '.nuxt', 'generated', 'ui.ts')],
          $uiConfig: join(process.cwd(), '.nuxt', 'generated', 'uiConfig.ts'),
        },
      },
    },
  },

  hooks: {
    ready: async nuxt => {
      console.log('✔ Creating colors.json file...')
      const colors = nuxt.options.unocss?.presets
        ?.reduce((agg, preset: any) => {
          if (preset.theme?.colors) {
            return { ...agg, ...preset.theme.colors }
          }

          return agg
        }, {} as Record<string, string>)

      await writeFile(resolve('./shared/constants/colors.json'), JSON.stringify(colors, null, 2), 'utf8')
    },
  },

  // i18n
  i18n: {
    strategy: 'prefix_and_default',
    skipSettingLocaleOnNavigate: true,
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'lang',
      cookieDomain: undefined,
    },
    langDir: '../i18n',
    defaultLocale: 'en-US',
    locales: [
      {
        code: 'en-US',
        file: 'en-US_ui.json',
        dateFormat: 'MM/DD/YYYY',
        currency: 'USD',
        icon: 'i-emojione:flag-for-united-kingdom',
      },
      {
        code: 'cs-CZ',
        file: 'cs-CZ_ui.json',
        dateFormat: 'DD.MM.YYYY',
        currency: 'CZK',
        icon: 'i-emojione:flag-for-czechia',
      },
    ],
  },

  // Lodash
  lodash: { prefix: '' },

  pinia: {
    storesDirs: [],
  },

  // UnoCSS
  unocss: {
    preflight: false,
    presets: [
      presetUno(),
      presetIcons(),
      presetAttributify({ ignoreAttributes: ['size'] }),
      presetTypography(),
      gentlUIPreset(),
    ],
    transformers: [
      transformerDirectives(),
      transformerVariantGroup(),
    ],
    safelist: ['i-emojione:flag-for-united-kingdom', 'i-emojione:flag-for-czechia'],
    nuxtLayers: true,
  },
})

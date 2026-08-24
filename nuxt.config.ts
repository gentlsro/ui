// @unocss-include
import { existsSync } from 'node:fs'
import { createResolver } from 'nuxt/kit'
import { loadEnv } from 'vite'
import { writeFile } from 'node:fs/promises'
import { cwd, env as processEnv } from 'node:process'
import { prepareLocalNuxtLayers } from './prepare-layers'

const env = {
  ...import.meta.env,
  ...loadEnv('', processEnv.NUXT_DOTENV_DIR ?? cwd(), ''),
}

const isMonorepo = env.VITE_MONOREPO === 'true'
const { resolve } = createResolver(import.meta.url)
const hasUtilitiesLib = isMonorepo || existsSync(resolve('../Utilities'))

export default defineNuxtConfig({
  extends: hasUtilitiesLib ? [] : ['github:gentlsro/Utilities#2.3'],

  modules: [
    '@nuxtjs/i18n',
    '@unocss/nuxt',
    '@pinia/nuxt',
    '@nuxtjs/device',
    '@nuxt/icon',
    '@nuxt/fonts',
  ],

  $meta: {
    name: 'ui',
  },

  components: {
    dirs: [
      { path: './components', pathPrefix: false },
    ],
  },

  imports: {
    imports: [
      { name: 'useUIStore', from: resolve('./app/stores/ui.store.ts') },
      { name: 'useBreadcrumbs', from: resolve('./app/components/Breadcrumbs/functions/useBreadcrumbs') },
      { name: 'notify', from: resolve('./app/components/Notification/functions/useNotifications') },
    ],

    dirs: [
      resolve('./app/constants'),
      resolve('./app/functions'),
      resolve('./app/types'),
      resolve('./app/components/**/*.model.ts'),
    ],
  },

  app: {
    head: {
      title: 'Gentl UI',
      script: [
        {
          key: 'page-size-init',
          innerHTML: '(function(){var d=document.documentElement;var v=window.visualViewport;d.style.setProperty(\'--page-width\',d.clientWidth+\'px\');d.style.setProperty(\'--page-height\',d.clientHeight+\'px\');d.style.setProperty(\'--visual-viewport-width\',(v&&v.width||d.clientWidth)+\'px\');d.style.setProperty(\'--visual-viewport-height\',(v&&v.height||d.clientHeight)+\'px\');d.style.setProperty(\'--visual-viewport-offset-top\',(v&&v.offsetTop||0)+\'px\');d.style.setProperty(\'--visual-viewport-offset-left\',(v&&v.offsetLeft||0)+\'px\');})();',
          tagPosition: 'head',
        },
      ],
    },
  },

  css: [
    resolve('./app/css/reset.scss'),
    resolve('./app/css/typography.scss'),
    resolve('./app/css/perfect-scrollbar.css'),
    resolve('./app/css/main.scss'),
    resolve('./app/css/breakpoints.scss'),
    resolve('./app/css/zindex.scss'),
    resolve('./app/css/ripple.scss'),
    resolve('./app/css/colors.scss'),
    resolve('./app/css/hover-on-desktop-mixin.scss'),
  ],

  runtimeConfig: {
    public: {
      theme: undefined as string | undefined,
    },
  },

  alias: {
    $uiProps: resolve('./app/types/component-props.type.ts'),
  },

  build: {
    // No touchy or I cut fingers
    transpile: ['imask', 'vue-imask'],
  },

  future: {
    compatibilityVersion: 5,
  },

  nitro: {
    imports: {
      dirsScanOptions: { fileFilter: () => false },
    },
  },

  typescript: {
    tsConfig: {
      compilerOptions: {
        paths: {
          $uiProps: [resolve('./app/types/component-props.type.ts')],
        },
      },
    },
  },

  hooks: {
    'ready': prepareLocalNuxtLayers,

    'unocss:config': async config => {
      console.log('✔ Creating colors.json file...')
      const colors: Record<string, string> = {}
      const presets = config?.presets ?? []

      for await (const preset of presets) {
        const presetAwaited = typeof preset === 'function'
          ? await preset()
          : preset

        if (Array.isArray(presetAwaited)) {
          for await (const preset of presetAwaited) {
            const presetAwaited = typeof preset === 'function'
              ? await preset()
              : preset

            // @ts-expect-error - presetAwaited is of type Preset
            Object.assign(colors, presetAwaited?.theme?.colors)
          }
        } else {
          // @ts-expect-error - presetAwaited is of type Preset
          Object.assign(colors, presetAwaited?.theme?.colors)
        }
      }
      await writeFile(resolve('./app/constants/colors.json'), JSON.stringify(colors, null, 2), 'utf8')
    },
  },

  i18n: {
    strategy: 'prefix_and_default',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'lang',
      cookieDomain: undefined,
      redirectOn: 'no prefix',
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

  icon: {
    size: '1em',
    mode: 'svg',
  },

  pinia: {
    storesDirs: [],
  },

  unocss: {
    nuxtLayers: true,
  },
})

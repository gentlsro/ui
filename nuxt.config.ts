// @unocss-include
import { existsSync } from 'node:fs'
import { createResolver } from 'nuxt/kit'
import { writeFile } from 'node:fs/promises'

const { resolve } = createResolver(import.meta.url)
const utilitiesRevision = '83028177ba3eec7596eae585ae3eb947681253d6'
const hasUtilitiesLib = existsSync(resolve('../Utilities/nuxt.config.ts'))

export default defineNuxtConfig({
  extends: hasUtilitiesLib
    ? ['../Utilities']
    : [[
        `github:gentlsro/Utilities#${utilitiesRevision}`,
        // Resolve the downloaded layer's packages through the same installation as UI.
        { giget: { dir: resolve(`./node_modules/.gentl/utilities-${utilitiesRevision}`), force: true } },
      ]],

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
    transpile: ['imask'],
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
    // Native rendering consumes JSON/SVG data in CSR and SSR alike.
    provider: 'server',
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

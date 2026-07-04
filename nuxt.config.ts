// @unocss-include
import { createResolver } from 'nuxt/kit'
import { loadEnv } from 'vite'
import { writeFile } from 'node:fs/promises'
import { cwd, env as processEnv } from 'node:process'

const env = {
  ...import.meta.env,
  ...loadEnv('', processEnv.NUXT_DOTENV_DIR ?? cwd(), ''),
}

const isMonorepo = env.VITE_MONOREPO === 'true'

const { resolve } = createResolver(import.meta.url)

export default defineNuxtConfig({
  extends: isMonorepo ? [] : ['github:gentlsro/Utilities#v2.3'],

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

  future: {
    compatibilityVersion: 5,
  },

  imports: {
    imports: [
      { name: 'useUIStore', from: resolve('./app/stores/ui.store.ts') },
      { name: 'useBreadcrumbs', from: resolve('./app/components/Breadcrumbs/functions/useBreadcrumbs') },
      { name: 'notify', from: resolve('./app/components/Notification/functions/useNotifications') },
    ],
  },

  app: {
    head: {
      title: 'Gentl UI',
      script: [
        {
          key: 'page-size-init',
          innerHTML: '(function(){var d=document.documentElement;d.style.setProperty(\'--page-width\',d.clientWidth+\'px\');d.style.setProperty(\'--page-height\',d.clientHeight+\'px\');})();',
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
      theme: '',
    },
  },

  alias: {
    $uiProps: resolve('./app/types/component-props.type.ts'),
  },

  build: {
    // No touchy or I cut fingers
    transpile: ['imask', 'vue-imask'],
  },

  vite: {
    optimizeDeps: {
      include: [
        '@floating-ui/vue',
        'arktype',
        'axios',
        'change-case',
        'dayjs/esm',
        'dayjs/esm/locale/cs',
        'dayjs/esm/locale/en-gb',
        'dayjs/esm/plugin/customParseFormat',
        'dayjs/esm/plugin/dayOfYear',
        'dayjs/esm/plugin/duration',
        'dayjs/esm/plugin/isBetween',
        'dayjs/esm/plugin/isSameOrAfter',
        'dayjs/esm/plugin/isSameOrBefore',
        'dayjs/esm/plugin/isoWeek',
        'dayjs/esm/plugin/quarterOfYear',
        'dayjs/esm/plugin/timezone',
        'dayjs/esm/plugin/utc',
        'lodash-es',
        'perfect-scrollbar',
        'uuid',
        'zod',
      ],
    },
  },

  typescript: {
    includeWorkspace: true,
    tsConfig: {
      compilerOptions: {
        types: ['nuxt'],
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

  // @ts-expect-error - bad types
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

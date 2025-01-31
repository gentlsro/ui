import { addTemplate, createResolver, defineNuxtModule } from '@nuxt/kit'
import { existsSync } from 'node:fs'

const { resolve } = createResolver(import.meta.url)
const currentDir = resolve('..')

export default defineNuxtModule({
  setup: async (_, nuxt) => {
    console.log('✔ Creating ui virtual file...')
    const configPaths = nuxt.options._layers
      .map(layer => {
        const isBase = layer.cwd === currentDir
        const configPath = isBase ? 'config' : 'ui-config'

        return { path: resolve(layer.cwd, configPath), isBase, cwd: layer.cwd }
      })
      .filter(({ path }) => existsSync(`${path}.ts`))

    const code = `import { customDefu } from '$utilsLayer/shared/functions/custom-defu'
${configPaths.map(({ path }, idx) => `import config${idx} from '${path}'`).join('\n')}

export const uiConfig = customDefu(${configPaths.map((_, idx) => `config${idx}`).join(', ')})

export type IUIConfig = typeof uiConfig
export default uiConfig
`

    addTemplate({
      filename: 'generated/uiConfig.ts',
      write: true,
      getContents: () => code,
    })

    const base = configPaths.find(({ isBase }) => isBase)

    addTemplate({
      filename: 'generated/ui.ts',
      write: true,
      getContents: () => `export * from '${base?.cwd}/index'
`,
    })

    nuxt.hook('vite:extendConfig', config => {
      if (!config.resolve) {
        config.resolve = {}
      }

      if (!config.resolve.alias) {
        config.resolve.alias = {}
      }

      config.resolve.alias = {
        ...config.resolve.alias,
        $ui: `${nuxt.options.buildDir}/generated/ui.ts`,
        $uiConfig: `${nuxt.options.buildDir}/generated/uiConfig.ts`,
      }
    })
  },
})

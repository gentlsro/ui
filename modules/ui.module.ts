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

        return { path: resolve(layer.cwd, configPath) }
      })
      .filter(({ path }) => existsSync(`${path}.ts`))

    const code = `import { customDefu } from '$utils/shared/functions/custom-defu'
${configPaths.map(({ path }, idx) => `import config${idx} from '${path}'`).join('\n')}

export const uiConfig = customDefu(${configPaths.map((_, idx) => `config${idx}`).join(', ')})

export type IUIConfig = typeof uiConfig
export default uiConfig
`

    addTemplate({
      filename: 'generated/ui.ts',
      write: true,
      getContents: () => code,
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
        $uiConfig: `${nuxt.options.buildDir}/generated/ui.ts`,
      }
    })
  },
})

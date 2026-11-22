import { addTemplate, createResolver, defineNuxtModule } from 'nuxt/kit'
import type { Nuxt } from 'nuxt/schema'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

const { resolve } = createResolver(import.meta.url)
const currentDir = resolve('..')

const UI_CONFIG = '#build/uiConfig.ts'

function setAliasPaths(nuxt: Nuxt, alias: string, tsPath: string) {
  nuxt.options.typescript.tsConfig ??= {}
  nuxt.options.typescript.tsConfig.compilerOptions ??= {}
  nuxt.options.typescript.tsConfig.compilerOptions.paths ??= {}
  nuxt.options.typescript.tsConfig.compilerOptions.paths[alias] = [tsPath]
}

function generateUIConfigCode(configPaths: { path: string }[]) {
  return `import { customDefu } from '#layers/utilities/app/utils/custom-defu'
${configPaths.map(({ path }, idx) => `import config${idx} from '${path}'`).join('\n')}

const uiConfigMerged = customDefu(${configPaths.map((_, idx) => `config${idx}`).join(', ')})

type WrapObjects<T> = {
  [K in keyof T]: T[K] extends Array<any> | object
    ? T[K] extends null
      ? null
      : () => T[K]
    : T[K];
}

function wrapObjects<T extends Record<string, any>>(obj: T): WrapObjects<T> {
  const result = {} as WrapObjects<T>

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key]

      if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
        (result as any)[key] = () => value
      } else {
        (result as any)[key] = value
      }
    }
  }

  return result
}

type WrapProps<T> = {
  [K in keyof T]: T[K] extends { props: infer P }
    ? { props: WrapObjects<P> } & Omit<T[K], "props">
    : T[K];
};

function wrapProps<T extends Record<string, any>>(obj: T): WrapProps<T> {
  const result = {} as WrapProps<T>;

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];

      if (
        typeof value === "object" &&
        value !== null &&
        "props" in value &&
        typeof value.props === "object" &&
        value.props !== null
      ) {
        (result as any)[key] = {
          ...value,
          props: wrapObjects(value.props),
        };
      } else {
        (result as any)[key] = value;
      }
    }
  }

  return result;
}

export const uiConfig = wrapProps(uiConfigMerged)

export type IUIConfig = typeof uiConfig
export default uiConfig
`
}

export default defineNuxtModule({
  setup: async (_, nuxt) => {
    console.log('✔ Process UI...')

    // Mount the shared tooltip bubble once, next to the consumer's App. A file on disk, not a template: in development
    // Vue's component tracer adds a relative import to every component, which a virtual template's id cannot resolve
    const hostPath = join(nuxt.options.buildDir, 'ui-app.vue')
    const tooltipHostPath = resolve('../app/components/Tooltip/TooltipHost.vue')

    nuxt.hook('app:resolve', app => {
      // Preserve Nuxt's resolved app, including consumer overrides, across rebuilds.
      if (app.mainComponent !== hostPath) {
        mkdirSync(dirname(hostPath), { recursive: true })
        writeFileSync(hostPath, `<script setup>
import App from ${JSON.stringify(app.mainComponent)}
import TooltipHost from ${JSON.stringify(tooltipHostPath)}
</script>

<template>
  <TooltipHost />
  <App />
</template>
`)
        app.mainComponent = hostPath
      }
    })

    const configPaths = nuxt.options._layers
      .map(layer => {
        const isBase = layer.cwd === currentDir
        const configPath = isBase ? 'config' : 'ui-config'

        return { path: resolve(layer.cwd, 'app', configPath) }
      })
      .filter(({ path }) => existsSync(`${path}.ts`))

    const configCode = generateUIConfigCode(configPaths)

    addTemplate({
      filename: 'uiConfig.ts',
      write: true,
      getContents: () => configCode,
    })

    setAliasPaths(nuxt, '$uiConfig', './uiConfig.ts')

    nuxt.hook('vite:extendConfig', (config) => {
      if (config.resolve) {
        config.resolve.alias = {
          ...config.resolve.alias,
          $uiConfig: UI_CONFIG,
        }
      }
    })
  },
})

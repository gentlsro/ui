import { addTemplate, addTypeTemplate, createResolver, defineNuxtModule } from 'nuxt/kit'
import type { Nuxt } from 'nuxt/schema'
import { existsSync } from 'node:fs'
import { basename } from 'node:path'

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
${configPaths.map(({ path }, idx) => `import config${idx}, * as configModule${idx} from '${path}'`).join('\n')}

const uiConfigMerged = customDefu(${configPaths.map((_, idx) => `config${idx}`).join(', ')})
export const uiClassLayers = [${configPaths.map((_, idx) => `configModule${idx}`).reverse().join(', ')}] as const

type WrappedValue<Value> = Value extends (...args: never[]) => unknown
  ? Value
  : Value extends object ? () => Value : Value

type WrapObjects<T> = {
  [K in keyof T]: WrappedValue<T[K]>;
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

export type UIConfigValues = typeof uiConfigMerged
export type IUIConfig = typeof uiConfig
export default uiConfig
`
}

export default defineNuxtModule({
  setup: async (_, nuxt) => {
    console.log('✔ Process UI...')

    const configPaths = nuxt.options._layers
      .map(layer => {
        const isBase = layer.cwd === currentDir
        const configPath = isBase ? 'config' : 'ui-config'
        const name = isBase
          ? 'ui'
          : layer.cwd === nuxt.options.rootDir
            ? 'app'
            : layer.meta?.name ?? basename(layer.cwd)

        return { path: resolve(layer.cwd, 'app', configPath), name }
      })
      .filter(({ path }) => existsSync(`${path}.ts`))

    const configCode = generateUIConfigCode(configPaths)

    addTemplate({
      filename: 'uiConfig.ts',
      write: true,
      getContents: () => configCode,
    })

    // Read only named class metadata; ordinary props may use the final types.
    const orderedConfigs = [...configPaths].reverse()
    const classTypesPath = resolve(currentDir, 'app/types/ui-class-config.type')

    addTypeTemplate({
      filename: 'types/ui-class-config.d.ts',
      getContents: () => `import type { ApplyUIClassConfig, BaseUIClasses, UIClassesFromModule } from '${classTypesPath}'
${orderedConfigs.map(({ path }, idx) => `import type * as config${idx} from '${path}'`).join('\n')}

type Stage0 = BaseUIClasses
${orderedConfigs.map((_, idx) => `type Stage${idx + 1} = ApplyUIClassConfig<Stage${idx}, UIClassesFromModule<typeof config${idx}>>`).join('\n')}

declare module '${classTypesPath}' {
  interface UILayerClassRegistry {
${orderedConfigs.map(({ name }, idx) => `    ${JSON.stringify(name)}: Stage${idx}`).join('\n')}
  }
  interface UIClassRegistry {
    defaults: Stage${orderedConfigs.length}
  }
}
export {}
`,
    })

    setAliasPaths(nuxt, '$uiConfig', './uiConfig.ts')

    nuxt.hook('vite:extendConfig', config => {
      if (config.resolve) {
        config.resolve.alias = {
          ...config.resolve.alias,
          $uiConfig: UI_CONFIG,
        }
      }
    })
  },
})

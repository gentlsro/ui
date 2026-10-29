// @unocss-include

import { uiConfigLayers } from '$uiConfig'
import { normalizeClass } from 'vue'
import type { UIResolvedClasses } from '../../../types/ui-config.type'

export const FORM_BASE_DEFAULTS = {
  ui: {
    containerClass() {
      const base = 'flex flex-col gap-2 grow overflow-auto'
      const gap = 'gap-2'

      return {
        base,
        gap,
        all: `${base} ${gap}`,
      } as const
    },

    contentClass() {
      const base = 'relative flex flex-col grow overflow-auto'
      const gap = 'gap-2'
      const padding = 'p-2'

      return {
        base,
        gap,
        padding,
        all: `${base} ${gap} ${padding}`,
      } as const
    },

    controlsClass() {
      const base = 'sticky flex items-center shrink-0 gap-2 bottom-0 z-1 rounded-b-custom'
      const border = 'border-t-1 border-ca [&.is-controls-on-top]:(order-first border-t-0 border-b-1 rounded-b-0 rounded-t-custom)'
      const background = 'bg-white dark:bg-dark-950'
      const padding = 'p-y-1 p-x-2'

      return {
        base,
        border,
        background,
        padding,
        all: `${base} ${border} ${background} ${padding}`,
      } as const
    },

    submitWrapperClass() {
      const base = 'flex gap-2 relative'

      // Presets
      const fullWidth = `${base} grow`

      return {
        base,
        fullWidth,
        all: `${base} m-l-auto`,
      } as const
    },

    submitClass() {
      const base = 'bg-primary color-white'

      // Presets
      const fullWidth = `${base} grow`

      return {
        base,
        fullWidth,
        all: `${base} w-40`,
      } as const
    },

    cancelClass() {
      const base = 'w-auto'

      return {
        base,
        all: `${base}`,
      } as const
    },
  },
}

type FormFactories = typeof FORM_BASE_DEFAULTS.ui
type Surface = keyof FormFactories
type Resolvers = {
  [Key in Surface]: () => UIResolvedClasses['form'][Key]
}

type ConfigLayer = {
  default?: { form?: { props?: { ui?: Record<string, unknown> } } }
}

/** Prepare Form's existing config callbacks once, on first use. */
function resolveFormDefaults(): Resolvers {
  const factories = FORM_BASE_DEFAULTS.ui
  const resolved = {} as Resolvers
  const surfaces = Object.keys(factories) as Surface[]

  function prepare() {
    const layers = uiConfigLayers as readonly ConfigLayer[]

    for (const surface of surfaces) {
      const baseFactory = factories[surface]
      const callbacks = layers.map(layer => layer.default?.form?.props?.ui?.[surface])
        .filter((callback): callback is (payload: { defaults: object, p: (...keys: never[]) => string }) => unknown => typeof callback === 'function')
      const factory = callbacks.length
        ? () => {
            let defaults: { all: string } = baseFactory()

            for (const callback of callbacks) {
              const value = callback(withClassPicker({ defaults }))
              const all = typeof value === 'string' ? value : normalizeClass(value)

              if (all !== defaults.all) {
                defaults = { ...defaults, all }
              }
            }

            return defaults
          }
        : baseFactory

      Object.defineProperty(resolved, surface, { value: factory, enumerable: true, configurable: true })
    }
  }

  for (const surface of surfaces) {
    Object.defineProperty(resolved, surface, {
      enumerable: true,
      configurable: true,
      get() {
        prepare()

        return resolved[surface]
      },
    })
  }

  return resolved
}

export const FORM_DEFAULT_PROPS = {
  ui: resolveFormDefaults(),
}

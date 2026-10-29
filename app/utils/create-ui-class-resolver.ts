import { withClassPicker } from '../functions/with-class-picker'
import type { UIClassDefinitions } from '../types/ui-class-definitions.type'
import type { UIClassPicker, UIClassSurface, UIResolvedClasses } from '../types/ui-class-config.type'

type Slots = { [key: string]: string | Slots | undefined }
type Patch = Slots | ((payload: { defaults: Slots, props: unknown }) => Slots)
type Composer = (slots: Slots, props: unknown) => string
type RuntimeConfig = {
  classDefaults?: Record<string, Record<string, Patch>>
  classComposition?: Record<string, Record<string, Composer>>
}
type FactoryArgs<Factory> = Factory extends (...args: infer Args) => unknown ? Args : never

type Resolvers<Component extends keyof UIClassDefinitions> = {
  [Surface in UIClassSurface<Component>]: (
    ...args: FactoryArgs<UIClassDefinitions[Component]['slots'][Surface]>
  ) => UIClassPicker<UIResolvedClasses[Component][Surface & keyof UIResolvedClasses[Component]] & object>
}

type ClassDefinition = {
  slots: object
  compose: object
  defaults: object
  derive?: object
}

function mergeSlots(defaults: Slots, patch: Slots, inPlace = false): Slots {
  const result = inPlace ? defaults : { ...defaults }

  for (const key of Object.keys(patch)) {
    const value = patch[key]

    if (value !== undefined) {
      result[key] = typeof value === 'string'
        ? value
        : mergeSlots(typeof defaults[key] === 'object' ? defaults[key] : {}, value, inPlace)
    }
  }

  return result
}

/** Prepare each component once on first use; untouched surfaces retain their default factory. */
export function createUIClassResolver<Component extends keyof UIClassDefinitions>(
  component: Component,
  definition: ClassDefinition,
  getLayers: () => readonly unknown[],
): Resolvers<Component> {
  const resolved = {} as Record<string, (props: unknown) => object>
  const surfaces = Object.keys(definition.slots)

  function prepare() {
    // defineUIClasses validates the component/surface correlation before runtime.
    const layers = (getLayers() as readonly { uiClasses?: RuntimeConfig }[])
      .flatMap(layer => layer.uiClasses ? [layer.uiClasses] : [])
    const factories = definition.slots as Record<string, (props: unknown) => Slots>
    const composers = definition.compose as Record<string, Composer>
    const derivations = definition.derive as Record<string, Record<string, Composer>> | undefined
    const defaults = definition.defaults as Record<string, (props: unknown) => object>

    for (const surface of surfaces) {
      const patches: Patch[] = []
      const makeSlots = factories[surface]!
      let compose = composers[surface]!
      const derived = Object.entries(derivations?.[surface] ?? {})

      for (const layer of layers) {
        const patch = layer.classDefaults?.[component]?.[surface]
        const overrideComposer = layer.classComposition?.[component]?.[surface]

        if (patch) {
          const previous = patches.at(-1)

          if (typeof patch === 'object' && typeof previous === 'object') {
            patches[patches.length - 1] = mergeSlots(previous, patch)
          } else {
            patches.push(patch)
          }
        }

        if (overrideComposer) {
          compose = overrideComposer
        }
      }

      const factory = !patches.length && compose === composers[surface]
        ? defaults[surface]
        : (props: unknown) => {
            let slots = makeSlots(props)
            const explicitDerived = derived.length ? new Set<string>() : undefined

            for (const patch of patches) {
              const changes = typeof patch === 'function' ? patch({ defaults: slots, props }) : patch
              // Slot factories return fresh maps, so merging in place cannot leak between instances.
              slots = mergeSlots(slots, changes, true)

              for (const [key, derive] of derived) {
                if (changes[key] !== undefined) {
                  explicitDerived!.add(key)
                } else if (!explicitDerived!.has(key)) {
                  slots[key] = derive(slots, props)
                }
              }
            }

            return withClassPicker({ ...slots, all: compose(slots, props) })
          }

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

  return resolved as unknown as Resolvers<Component>
}

import { uiClassParents, uiConfig, uiConfigLayers } from '$uiConfig'
import { normalizeClass } from 'vue'
import type {
  ComponentName,
  ComponentPropOverrides,
  ComponentProps,
} from './get-component-props'

export function extendNestedComponentProps<
  Name extends ComponentName,
  Key extends keyof ComponentProps<Name>,
>(
  componentName: Name,
  propName: Key,
  overrides: ComponentPropOverrides<ComponentProps<Name>[Key]> | undefined,
  options?: {
    mergeFnc?: (
      defaults: ComponentProps<Name>[Key],
      overrides: ComponentPropOverrides<ComponentProps<Name>[Key]> | undefined,
    ) => NonNullable<ComponentProps<Name>[Key]>
  },
): NonNullable<ComponentProps<Name>[Key]> {
  const props = uiConfig[componentName].props as Record<PropertyKey, unknown>
  const value = props[propName]
  const defaultPropValue = (typeof value === 'function' ? value.call(props) : value) as
    ComponentProps<Name>[Key]

  // Merge using provided merge function or fallback to default merging
  const mergedProps = options?.mergeFnc
    ? options.mergeFnc(defaultPropValue, overrides)
    : { ...defaultPropValue, ...overrides }

  if (propName === 'ui') {
    return mergeUIClasses(componentName, mergedProps as Record<string, unknown>) as NonNullable<ComponentProps<Name>[Key]>
  }

  return mergedProps as NonNullable<ComponentProps<Name>[Key]>
}

type ClassPayload = { defaults: { all: string }, p: (...keys: never[]) => string }
type ClassCallback = (payload: ClassPayload) => unknown
type ClassChain = { callbacks: ClassCallback[], owners: Set<string> }
const classCallbacks = new Map<string, Map<string, ClassChain>>()
const callbackOwners = new WeakMap<ClassCallback, Set<string>>()

function getClassCallbacks(componentName: string) {
  let surfaces = classCallbacks.get(componentName)
  if (surfaces) {
    return surfaces
  }
  surfaces = new Map<string, ClassChain>()
  for (const [surface, parents] of Object.entries(uiClassParents[componentName] ?? {})) {
    // Responsive proxies choose their parent when rendered by Menu or Dialog.
    if (parents.length === 1) {
      const inherited = getClassCallbacks(parents[0]!).get(surface)
      if (inherited) {
        surfaces.set(surface, { callbacks: [...inherited.callbacks], owners: new Set([...inherited.owners, componentName]) })
      }
    }
  }
  const layers = uiConfigLayers as readonly { default: Record<string, { props?: { ui?: Record<string, unknown> } }> }[]
  for (const layer of layers) {
    for (const [surface, callback] of Object.entries(layer.default[componentName]?.props?.ui ?? {})) {
      if (surface.endsWith('Class') && typeof callback === 'function') {
        const chain = surfaces.get(surface) ?? { callbacks: [], owners: new Set([componentName]) }
        chain.callbacks.push(callback as ClassCallback)
        surfaces.set(surface, chain)
      }
    }
  }
  classCallbacks.set(componentName, surfaces)

  return surfaces
}

/** Cache callback chains when props merge, rather than rebuilding them per render. */
function mergeUIClasses(componentName: string, ui: Record<string, unknown>) {
  for (const [surface, configured] of getClassCallbacks(componentName)) {
    const override = ui[surface] as ClassCallback | undefined
    if (override && callbackOwners.get(override)?.has(componentName)) {
      continue
    }
    if (override !== undefined && typeof override !== 'function') {
      continue
    }
    const callbacks = override && override !== configured.callbacks.at(-1)
      ? [...configured.callbacks, override]
      : configured.callbacks
    if (callbacks.length === 1) {
      ui[surface] = callbacks[0]
      continue
    }
    const callback: ClassCallback = payload => {
      let current = payload
      for (const callback of callbacks) {
        const value = callback(current)
        const all = typeof value === 'string' ? value : normalizeClass(value)
        if (all !== current.defaults.all) {
          current = withClassPicker({ ...current, defaults: { ...current.defaults, all } })
        }
      }

      return current.defaults.all
    }
    callbackOwners.set(callback, configured.owners)
    ui[surface] = callback
  }

  return ui
}

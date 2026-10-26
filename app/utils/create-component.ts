// Types
import type { Component, VaporComponent } from 'vue'
import type { ComponentProps } from '#layers/utilities/app/types/component-map.type'
import { resolveRegisteredComponent } from './resolve-registered-component'

type ComponentDescriptor<T extends Component | VaporComponent> = {
  component: T
  props?: ComponentProps<T>
  icon?: string
}

export function createComponent<T extends Component | VaporComponent>(payload: ComponentDescriptor<T>): ComponentDescriptor<T>
export function createComponent<T extends Component | VaporComponent>(payload?: {
  component: T | string | (() => T)
  props?: ComponentProps<T>
  icon?: string
}): ComponentDescriptor<T> | undefined

/**
 * Returns an object with raw component and props.
 * It can be used even if nuxt/vue instance is not available
 */
export function createComponent<T extends Component | VaporComponent>(payload?: {
  component: T | string | (() => T)
  props?: ComponentProps<T>
  icon?: string
}): ComponentDescriptor<T> | undefined {
  if (!payload) {
    return undefined
  }

  const { component: componentSrc, props, icon } = payload
  let component = componentSrc as T

  // Case: component is provided by name and resolved through Vite's glob registry.
  if (typeof componentSrc === 'string') {
    component = resolveRegisteredComponent(componentSrc) as T
  }

  // Case: we provide an actual component imported via `import` statement
  else if (typeof componentSrc === 'object') {
    component = markRaw(componentSrc)
  }

  // Callable Vapor components are render functions; only legacy resolvers run here.
  else if (typeof componentSrc === 'function' && !('__vapor' in componentSrc && componentSrc.__vapor === true)) {
    component = (componentSrc as () => T)()
  }

  return {
    component: markRaw(component),
    props,
    icon: icon ?? 'i-carbon:unknown',
  }
}

// Types
import type { Component, VaporComponent } from 'vue'
import type { ComponentProps } from '#layers/utilities/app/types/component-map.type'
import { resolveRegisteredComponent } from './resolve-registered-component'

type UIComponent = Component | VaporComponent

type ComponentDescriptor<T extends UIComponent> = {
  component: T
  props?: ComponentProps<T>
  icon?: string
}

type ComponentSource<T extends UIComponent> = Omit<ComponentDescriptor<T>, 'component'> & {
  component: T | string | (() => T)
  /** A callable VDOM component with no arguments is indistinguishable from a legacy resolver. */
  functional?: boolean
}

export function createComponent<T extends UIComponent>(payload: ComponentDescriptor<T> & { functional?: boolean }): ComponentDescriptor<T>
export function createComponent<T extends UIComponent>(payload?: ComponentSource<T>): ComponentDescriptor<T> | undefined

/** Resolve descriptors even outside component setup. */
export function createComponent<T extends UIComponent>(payload?: ComponentSource<T>): ComponentDescriptor<T> | undefined {
  if (!payload) {
    return undefined
  }

  const { component: componentSrc, props, icon } = payload
  let component = componentSrc as T

  if (typeof componentSrc === 'string') {
    component = resolveRegisteredComponent(componentSrc) as T
  } else if (typeof componentSrc === 'function' && componentSrc.length === 0 && !payload.functional
    && !('__vapor' in componentSrc && componentSrc.__vapor === true)) {
    // Zero-argument factories are the legacy resolver form.
    component = (componentSrc as () => T)()
  }

  return {
    component: markRaw(component),
    props,
    icon: icon ?? 'i-carbon:unknown',
  }
}

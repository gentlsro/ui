// Types
import type { ComponentProps, IComponent } from '$utilsLayer/shared/types/component-map.type'

/**
 * Returns an object with raw component and props.
 * It can be used even if nuxt/vue instance is not available
 */
export function createComponent<T extends Component>(payload?: {
  component: any
  props?: ComponentProps<T>
  icon?: string
}) {
  if (!payload) {
    return undefined
  }

  const { component: componentSrc, props, icon } = payload
  let component = componentSrc as T

  if (typeof componentSrc === 'function') {
    component = componentSrc()
  }

  return {
    component: markRaw(component),
    props,
    icon: icon ?? 'i-carbon:unknown',
  }
}

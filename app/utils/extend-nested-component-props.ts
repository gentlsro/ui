import { uiConfig } from '$uiConfig'
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

  return mergedProps as NonNullable<ComponentProps<Name>[Key]>
}

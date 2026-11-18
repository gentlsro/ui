// @ts-nocheck

import { uiConfig } from '$uiConfig'
import type { IUIConfig } from '$uiConfig'
import type { IUIConfig as IUIGenericConfig } from '../types/ui-config.type'

// Functions
import { extendNestedComponentProps } from './extend-nested-component-props'

type ConfigWithPropsKeys<T> = {
  [K in keyof T]: T[K] extends { props: any } ? K : never
}[keyof T]

type ConfigWithMergeKeys<T> = {
  [K in keyof T]: T[K] extends { merge: any } ? K : never
}[keyof T]

type PickProps<T, Keys extends readonly (keyof T)[]> = {
  [K in Keys[number]]: GetValue<T[K]>;
}

type GetValue<T> = T extends (...args: any[]) => any ? ReturnType<T> : T

/**
 * Returns the configured default props of a component.
 *
 * When `keys` is provided, only those props are returned. Use it when the component
 * declares just a subset of the config section's props, because Vue warns about every
 * default key that has no corresponding prop declaration.
 */
export function getComponentProps<T extends ConfigWithPropsKeys<IUIConfig>>(
  componentName: T,
): IUIConfig[T]['props']
export function getComponentProps<
  T extends ConfigWithPropsKeys<IUIConfig>,
  K extends keyof IUIConfig[T]['props'],
>(
  componentName: T,
  keys: readonly K[],
): Pick<IUIConfig[T]['props'], K>
export function getComponentProps<T extends ConfigWithPropsKeys<IUIConfig>>(
  componentName: T,
  keys?: readonly PropertyKey[],
) {
  const props = uiConfig[componentName].props as IUIConfig[T]['props']

  if (!keys) {
    return props
  }

  return keys.reduce((agg, key) => {
    if (key in props) {
      agg[key] = props[key]
    }

    return agg
  }, {} as IItem)
}

export function getComponentMergedProps<
  T extends ConfigWithMergeKeys<IUIConfig>,
>(
  componentName: T,
  props: IItem,
) {
  const propsToMerge = uiConfig[componentName].merge as IUIConfig[T]['merge']

  return propsToMerge?.reduce((agg, propName) => {
    // @ts-expect-error
    agg[propName] = extendNestedComponentProps(componentName, propName, props[propName])

    return agg

    // @ts-expect-error
  }, {} as PickProps<IUIGenericConfig[T]['props'], typeof propsToMerge>)
}

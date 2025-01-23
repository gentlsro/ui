import { uiConfig } from '$uiConfig'
import type { IUIConfig } from '$uiConfig'
import type { IUIConfig as IUIGenericConfig } from '$ui/config'

// Functions
import { extendNestedComponentProps } from './extend-nested-component-props'

type ConfigWithPropsKeys<T> = {
  [K in keyof T]: T[K] extends { props: any } ? K : never
}[keyof T]

type ConfigWithMergeKeys<T> = {
  [K in keyof T]: T[K] extends { merge: any } ? K : never
}[keyof T]

export type PropsDefaults<T> = {
  [K in keyof T]: NonNullable<T[K]> extends Function
    ? T[K]
    : NonNullable<T[K]> extends Array<any> | Record<string, any>
      ? () => NonNullable<T[K]>
      : T[K]
}

type PickProps<T, Keys extends readonly (keyof T)[]> = {
  [K in Keys[number]]: GetValue<T[K]>;
}

type GetValue<T> = T extends (...args: any[]) => any ? ReturnType<T> : T

export function getComponentProps<T extends ConfigWithPropsKeys<IUIConfig>>(
  componentName: T,
) {
  return uiConfig[componentName].props as typeof uiConfig[T]['props'] as IUIConfig[T]['props']
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

import uiConfig from '$uiConfig'

type ConfigWithPropsKeys<T> = {
  [K in keyof T]: T[K] extends { props: infer P } ? K : never
}[keyof T]

type GetValue<T> = T extends (...args: any[]) => any ? ReturnType<T> : T

export function extendNestedComponentProps<
  T extends ConfigWithPropsKeys<typeof uiConfig>,
  U extends typeof uiConfig[T]['props'],
  // @ts-expect-error Fuck this
  K extends GetValue<typeof uiConfig[T]['props'][keyof U]>,
>(
  componentName: T,
  propName: keyof U,
  overrides: K,
  options?: {
    mergeFnc?: (obj: K, override: Partial<K>) => K
  },
): K {
  const props = uiConfig[componentName].props as U
  const defaultPropValue = typeof props[propName] === 'function'
    ? props[propName]()
    : props[propName]

  // Merge using provided merge function or fallback to default merging
  const mergedProps = options?.mergeFnc
    ? options.mergeFnc(defaultPropValue, {})
    : { ...defaultPropValue, ...overrides }

  return mergedProps
}

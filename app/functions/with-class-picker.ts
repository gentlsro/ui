type ClassKey<T> = {
  [K in keyof T]: T[K] extends string ? K : never
}[keyof T]

export type PickedClasses<Classes, Keys extends readonly PropertyKey[]>
  = number extends Keys['length']
    ? string
    : Keys extends readonly [infer Key extends keyof Classes, ...infer Rest extends PropertyKey[]]
      ? Rest extends []
        ? Extract<Classes[Key], string>
        : `${Extract<Classes[Key], string>} ${PickedClasses<Classes, Rest>}`
      : ''

/** Adds a typed picker beside the callback's class defaults. */
export function withClassPicker<T extends { defaults: object }>(payload: T) {
  const defaults: T['defaults'] = payload.defaults

  return Object.assign(payload, {
    p: <const Keys extends ClassKey<T['defaults']>[]>(...keys: Keys) => keys.map(key => defaults[key]).join(' ') as PickedClasses<T['defaults'], Keys>,
  })
}

export type WithClassPicker<T extends { defaults: object }>
  = ReturnType<typeof withClassPicker<T>>

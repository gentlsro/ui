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

/** Adds a typed picker for class strings; nested variant maps stay accessible directly. */
export function withClassPicker<T extends object>(classes: T) {
  return Object.assign(classes, {
    p: <const Keys extends ClassKey<T>[]>(...keys: Keys) => keys.map(key => classes[key]).join(' ') as PickedClasses<T, Keys>,
  })
}

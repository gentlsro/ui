type ClassKey<T> = {
  [K in keyof T]: T[K] extends string ? K : never
}[keyof T]

/** Adds a typed picker for class strings; nested variant maps stay accessible directly. */
export function withClassPicker<T extends object>(classes: T) {
  return Object.assign(classes, {
    p: (...keys: ClassKey<T>[]) => keys.map(key => classes[key]).join(' '),
  })
}

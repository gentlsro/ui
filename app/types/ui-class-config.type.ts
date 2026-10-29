import type { UIClassDefinitions } from './ui-class-definitions.type'

export type UIClassComponent = Extract<keyof UIClassDefinitions, string>
export type UIClassSurface<Component extends UIClassComponent>
  = Extract<keyof UIClassDefinitions[Component]['slots'], string>

type ClassFactoryProps<Factory>
  = Factory extends (...args: infer Args) => unknown
    ? Args extends [infer Props, ...unknown[]]
      ? Props
      : undefined
    : undefined

type ClassFactorySlots<Factory>
  = Factory extends (...args: never[]) => infer Slots
    ? Slots extends object
      ? Slots
      : never
    : never

export type UIClassProps<
  Component extends UIClassComponent,
  Surface extends UIClassSurface<Component>,
> = ClassFactoryProps<UIClassDefinitions[Component]['slots'][Surface]>

// Kept for Button consumers written before the shared class schema.
export type ButtonClassSurface = UIClassSurface<'button'>
export type ButtonClassProps<Surface extends ButtonClassSurface>
  = UIClassProps<'button', Surface>

/** Raw named slots, before composing `all` or attaching its picker. */
export type BaseUIClasses = {
  [Component in UIClassComponent]: {
    [Surface in UIClassSurface<Component>]: ClassFactorySlots<UIClassDefinitions[Component]['slots'][Surface]>
  }
}

export type UIClassSet = {
  [Component in UIClassComponent]: { [Surface in UIClassSurface<Component>]: object }
}

// The conditional keeps component/surface correlation when indexing a generic registry.
type SlotsOf<
  Classes extends UIClassSet,
  Component extends UIClassComponent,
  Surface extends UIClassSurface<Component>,
> = Surface extends keyof Classes[Component]
  ? Classes[Component][Surface] & object
  : never

// Generated per Nuxt application. Each layer receives only its predecessors.
// eslint-disable-next-line ts/consistent-type-definitions
export interface UILayerClassRegistry {}
// eslint-disable-next-line ts/consistent-type-definitions
export interface UIClassRegistry {}

export type UILayerId = keyof UILayerClassRegistry extends never
  ? string
  : Extract<keyof UILayerClassRegistry, string>

export type UIClassesBefore<Layer extends string>
  = Layer extends keyof UILayerClassRegistry
    ? UILayerClassRegistry[Layer] extends UIClassSet
      ? UILayerClassRegistry[Layer]
      : BaseUIClasses
    : BaseUIClasses

export type UIResolvedClasses = UIClassRegistry extends {
  defaults: infer Defaults extends UIClassSet
}
  ? Defaults
  : BaseUIClasses

type ClassKey<Slots> = {
  [Key in keyof Slots]-?: Slots[Key] extends string ? Key : never
}[keyof Slots]

export type UIClassPicker<Slots extends object> = Slots & {
  all: string
  p: (...keys: (ClassKey<Slots> | 'all')[]) => string
}

type ClassPatchValue = string | { readonly [key: string]: ClassPatchValue | undefined }

type ClassPatchFields<Slots extends object> = {
  readonly [Key in keyof Slots]?: Exclude<Slots[Key], undefined> extends string
    ? string
    : Exclude<Slots[Key], undefined> extends object
      ? ClassPatchFields<Exclude<Slots[Key], undefined>>
      : never
} & { readonly [key: string]: ClassPatchValue | undefined }

/** `all` and `p` are derived from the resolved slots and cannot be patched. */
export type UIClassPatch<Slots extends object = object> = ClassPatchFields<Slots> & {
  all?: never
  p?: never
}

export type UIClassDefaults<Previous extends UIClassSet> = {
  [Component in UIClassComponent]?: {
    [Surface in UIClassSurface<Component>]?: UIClassPatch<SlotsOf<Previous, Component, Surface>> | ((payload: {
      defaults: SlotsOf<Previous, Component, Surface>
      props: UIClassProps<Component, Surface>
    }) => UIClassPatch<SlotsOf<Previous, Component, Surface>>)
  }
}

type MergeClassObjects<Previous extends object, Patch extends object> = {
  [Key in keyof Previous]: Key extends keyof Patch
    ? MergeClassSlots<Previous[Key], Patch[Key]>
    : Previous[Key]
} & {
  [Key in keyof Patch as Key extends keyof Previous ? never : Key]: Patch[Key]
}

/** Replaces leaves while preserving unpatched and optional nested slots. */
type MergeClassSlots<Previous, Patch> = Patch extends undefined
  ? Previous
  : Previous extends object
    ? Patch extends object
      ? MergeClassObjects<Previous, Patch>
      : Patch
    : Patch

type FieldOf<Source, Key extends PropertyKey> = Source extends unknown
  ? Key extends keyof Source
    ? Source[Key]
    : undefined
  : never

type ApplyClassObjectPatch<Slots extends object, Patch> = Patch extends object
  ? MergeClassObjects<Slots, Patch>
  : Slots

type ApplyClassPatch<Slots extends object, Patch>
  = Patch extends (...args: never[]) => infer Result
    ? ApplyClassObjectPatch<Slots, Result>
    : ApplyClassObjectPatch<Slots, Patch>

export type ApplyUIClassConfig<Previous extends UIClassSet, Config> = {
  [Component in UIClassComponent]: {
    [Surface in UIClassSurface<Component>]: ApplyClassPatch<
      SlotsOf<Previous, Component, Surface>,
      FieldOf<FieldOf<FieldOf<Config, 'classDefaults'>, Component>, Surface>
    >
  }
}

type WidenClassValue<Value> = Value extends string
  ? string
  : Value extends object
    ? { [Key in keyof Value]: WidenClassValue<Value[Key]> }
    : Value

export type WidenClassSlots<Slots> = {
  [Key in keyof Slots]: WidenClassValue<Slots[Key]>
}

/** Composers run after all layers, so later overrides can change every value. */
export type UIClassComposers<Classes extends UIClassSet> = {
  [Component in UIClassComponent]?: {
    [Surface in UIClassSurface<Component>]?: (
      slots: WidenClassSlots<SlotsOf<Classes, Component, Surface>>,
      props: UIClassProps<Component, Surface>,
    ) => string
  }
}

/** Inspect only the class export; ordinary config inference may use final defaults. */
export type UIClassesFromModule<Module> = 'uiClasses' extends keyof Module
  ? Module['uiClasses']
  : object

export type UIClassConfigBuilder<
  Previous extends UIClassSet,
  Defaults extends UIClassDefaults<Previous>,
> = {
  classDefaults: Defaults
  compose: <const Composers extends UIClassComposers<ApplyUIClassConfig<Previous, { classDefaults: Defaults }>>>(
    composers: Composers,
  ) => { classDefaults: Defaults, classComposition: Composers }
}

import { uiConfig } from '$uiConfig'
import type { IUIConfig as GeneratedConfig, UIConfigValues } from '$uiConfig'
import type { BaseUIClasses, IUIConfig, UIProps } from '../types/ui-config.type'
import { extendNestedComponentProps } from './extend-nested-component-props'

type ComponentConfigs = {
  [Name in keyof GeneratedConfig as GeneratedConfig[Name] extends {
    props: object
  } ? Name : never]: GeneratedConfig[Name]
}

export type ComponentName = keyof ComponentConfigs

// UI components expose optional props beyond their configured defaults. Layers
// can also register components; their raw config supplies the fallback contract.
export type ComponentProps<Name extends ComponentName>
  = Name extends keyof IUIConfig
    ? IUIConfig[Name] extends { props: infer Props } ? Props : never
    : Name extends keyof UIConfigValues
      ? UIConfigValues[Name] extends { props: infer Props } ? Props : never
      : never

type ComponentMergeName = {
  [Name in ComponentName]: 'merge' extends keyof ComponentConfigs[Name]
    ? Name
    : never
}[ComponentName]

type MergeKeys<Name extends ComponentMergeName>
  = ComponentConfigs[Name] extends { merge?: readonly (infer Key)[] }
    ? Extract<Key, keyof ComponentProps<Name>>
    : never

// Wrapped callbacks accept base defaults here and resolve them before calling consumers.
type ComponentRuntimeProps<Name extends ComponentName>
  = Name extends keyof BaseUIClasses
    ? UIProps<ComponentProps<Name>, {
      [Surface in keyof BaseUIClasses[Name]]: Omit<BaseUIClasses[Name][Surface], 'all'> & { all: string }
    }>
    : ComponentProps<Name>

type ComponentMergedProps<Name extends ComponentMergeName>
  = Pick<ComponentRuntimeProps<Name>, Extract<MergeKeys<Name>, keyof ComponentRuntimeProps<Name>>>

type ComponentMergeResult<Name extends ComponentMergeName>
  = ComponentConfigs[Name] extends { merge: readonly unknown[] }
    ? ComponentMergedProps<Name>
    : ComponentMergedProps<Name> | undefined

export type ComponentPropOverrides<Value>
  = Value extends (...args: never[]) => unknown
    ? Value
    : Value extends object ? Partial<Value> : Value

export function getComponentProps<Name extends ComponentName>(
  componentName: Name,
): ComponentConfigs[Name]['props'] {
  const config: ComponentConfigs[Name] = uiConfig[componentName]

  return config.props
}

export function getComponentMergedProps<Name extends ComponentMergeName>(
  componentName: Name,
  props: object,
): ComponentMergeResult<Name> {
  // Vue's resolved generic props can be narrower than the config schema. Only
  // the configured keys are read; their public contracts define the result.
  const overrides = props as {
    [Key in keyof ComponentProps<Name>]?: ComponentPropOverrides<ComponentProps<Name>[Key]>
  }
  const config = uiConfig[componentName] as {
    merge?: readonly (keyof ComponentProps<Name>)[]
  }

  const merged = config.merge?.reduce<Partial<ComponentProps<Name>>>((merged, propName) => {
    merged[propName] = extendNestedComponentProps(
      componentName,
      propName,
      overrides[propName],
    )

    return merged
  }, {})

  // The loop populates exactly the configured subset; TS cannot track dynamic
  // keys through reduce or correlate an optional merge list with its result.
  return merged as ComponentMergeResult<Name>
}

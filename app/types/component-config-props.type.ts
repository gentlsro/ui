import type { IUIConfig as GeneratedConfig, UIConfigValues } from '$uiConfig'
import type { IUIConfig } from './ui-config.type'

export type ComponentConfigs = {
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

export type ComponentMergeName = {
  [Name in ComponentName]: 'merge' extends keyof ComponentConfigs[Name]
    ? Name
    : never
}[ComponentName]

type MergeKeys<Name extends ComponentMergeName>
  = ComponentConfigs[Name] extends { merge?: readonly (infer Key)[] }
    ? Extract<Key, keyof ComponentProps<Name>>
    : never

export type ComponentMergedProps<Name extends ComponentMergeName>
  = Pick<ComponentProps<Name>, MergeKeys<Name>>

export type ComponentMergeResult<Name extends ComponentMergeName>
  = ComponentConfigs[Name] extends { merge: readonly unknown[] }
    ? ComponentMergedProps<Name>
    : ComponentMergedProps<Name> | undefined

export type ComponentPropOverrides<Value>
  = Value extends (...args: never[]) => unknown
    ? Value
    : Value extends object ? Partial<Value> : Value

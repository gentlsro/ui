import { uiConfig } from '$uiConfig'
import type {
  ComponentConfigs,
  ComponentMergeName,
  ComponentMergeResult,
  ComponentName,
  ComponentPropOverrides,
  ComponentProps,
} from '../types/component-config-props.type'

// Functions
import { extendNestedComponentProps } from './extend-nested-component-props'

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

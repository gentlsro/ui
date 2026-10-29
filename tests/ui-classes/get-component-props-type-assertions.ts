import { getComponentMergedProps, getComponentProps } from '../../app/utils/get-component-props'
import { extendNestedComponentProps } from '../../app/utils/extend-nested-component-props'

// Failure modes: wrapping a callback as a factory, unwrapping an object default
// too early, losing resolved class keys, and accepting unrelated nested props.
export function checkVueDefaults() {
  const button = getComponentProps('button')
  const list = getComponentProps('list')
  const table = getComponentProps('table')
  const buttonUI = button.ui()
  const searchConfig = list.searchConfig()
  const enabled: boolean = searchConfig.enabled
  const filterComponent: undefined = table.getFilterComponent()

  // @ts-expect-error Object defaults remain factories for Vue withDefaults.
  const invalidObjectDefault = button.ui.containerClass
  // @ts-expect-error Callable defaults must not become callback factories.
  table.getFilterComponent()()
  // @ts-expect-error Configuration metadata is not a component with props.
  getComponentProps('misc')

  return { buttonUI, enabled, filterComponent, invalidObjectDefault }
}

const _mergedButton = getComponentMergedProps('button', {})
const _mergedCheckbox = getComponentMergedProps('checkbox', {})
const _mergedList = getComponentMergedProps('list', {})

type MergedButtonDefaults = Parameters<NonNullable<NonNullable<typeof _mergedButton.ui>['containerClass']>>[0]['defaults']
type MergedCheckboxDefaults = Parameters<NonNullable<NonNullable<typeof _mergedCheckbox.ui>['containerClass']>>[0]['defaults']
type MergedListDefaults = Parameters<NonNullable<NonNullable<typeof _mergedList.ui>['containerClass']>>[0]['defaults']

export function checkMergedClassDefaults(
  button: MergedButtonDefaults,
  checkbox: MergedCheckboxDefaults,
  list: MergedListDefaults,
) {
  const buttonBase: 'button-app' = button.base
  const checkboxBase: 'checkbox-app' = checkbox.base
  const checkboxSmall: 'checkbox-app-sm' = checkbox.sizes.sm
  const listBase: 'list-app' = list.base
  button.p('theme', 'brand', 'application')
  list.p('theme', 'brand', 'application')
  // @ts-expect-error Nested maps do not become selectable class strings.
  checkbox.p('sizes')
  // @ts-expect-error Unknown keys must not be hidden by any.
  list.p('missing')
  // @ts-expect-error The picker itself is not a class string.
  button.p('p')

  return { buttonBase, checkboxBase, checkboxSmall, listBase }
}

export function checkNestedOverrides() {
  const buttonUI = extendNestedComponentProps('button', 'ui', {
    containerClass: ({ defaults }) => {
      const base: 'button-app' = defaults.base

      return `${base} ${defaults.p('theme', 'brand', 'application')}`
    },
  })
  const searchConfig = extendNestedComponentProps('list', 'searchConfig', {
    enabled: false,
  }, {
    mergeFnc: (defaults, overrides) => {
      const minChars: number | undefined = defaults?.minChars

      return { ...defaults, ...overrides, minChars }
    },
  })

  // @ts-expect-error Metadata has neither component props nor merge rules.
  getComponentMergedProps('misc', {})
  // @ts-expect-error A key belongs to the selected component.
  extendNestedComponentProps('button', 'notAProp', {})
  // @ts-expect-error Nested UI properties retain their callback contract.
  extendNestedComponentProps('button', 'ui', { containerClass: 'invalid' })
  // @ts-expect-error Search options cannot be replaced by an unrelated value.
  extendNestedComponentProps('list', 'searchConfig', { enabled: 'yes' })
  // @ts-expect-error Defaults passed to a custom merge retain their value types.
  extendNestedComponentProps('list', 'searchConfig', {}, { mergeFnc: defaults => ({ ...defaults, enabled: 'yes' }) })

  return { buttonUI, searchConfig }
}

export function checkLayerRegisteredComponent() {
  const defaults = getComponentProps('helperExtension')
  const ui = defaults.ui()
  const labels: string[] = defaults.labels()
  const callbackValue: string = defaults.callback('value')
  const nestedCallbackValue: string = ui.handler()
  const merged = getComponentMergedProps('helperExtension', {
    ui: { base: 'override', nested: { winner: 'override' } },
  })
  const retained: string = merged.ui.retained
  const nestedDefault: string | undefined = merged.ui.nested.defaultOnly
  const extended = extendNestedComponentProps('helperExtension', 'ui', {
    base: 'override',
  })
  const extendedHandler: string = extended.handler()

  // @ts-expect-error Array defaults remain Vue factories.
  defaults.labels.push('invalid')
  // @ts-expect-error Original callback arguments must be retained.
  defaults.callback(123)
  // @ts-expect-error Only configured merge keys are returned.
  const invalidMergedCallback = merged.callback
  // @ts-expect-error Extension prop names are checked against its own config.
  extendNestedComponentProps('helperExtension', 'unknown', {})
  // @ts-expect-error Extension nested overrides retain their value types.
  extendNestedComponentProps('helperExtension', 'ui', { base: 123 })

  return { labels, callbackValue, nestedCallbackValue, retained, nestedDefault, extendedHandler, invalidMergedCallback }
}

export function checkEmptyMergeList() {
  const merged = getComponentMergedProps('elementMovement', {})
  const empty: Record<string, never> = merged
  // @ts-expect-error An empty configured merge list produces no UI property.
  const invalidMergedUI = merged.ui

  return { empty, invalidMergedUI }
}

export function checkOptionalMergeList() {
  const merged = getComponentMergedProps('helperOptionalMerge', {})
  // @ts-expect-error An optional merge list can produce undefined.
  const required: { ui: { base: string } } = merged
  const optional: { ui: { base: string } } | undefined = merged
  const base: string | undefined = merged?.ui.base

  return { required, optional, base }
}

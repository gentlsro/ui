import type { IBtnProps } from '../../app/components/Button/types/btn-props.type'

type Defaults = Parameters<NonNullable<NonNullable<IBtnProps['ui']>['containerClass']>>[0]['defaults']
type IsAny<T> = 0 extends (1 & T) ? true : false
type Assert<T extends true> = T
export type DefaultsAreTyped = Assert<IsAny<Defaults> extends false ? true : false>

// The checks are compiled with the fixture's generated layer registry; never run.
export function verifyButtonDefaults(defaults: Defaults) {
  const base: 'app-base' = defaults.base
  const inherited: 'theme-only' = defaults.theme
  const branded: 'brand-only' = defaults.brand
  const application: 'app-only' = defaults.app
  const small: 'app-sm' = defaults.sizes.sm
  const large: 'brand-lg' = defaults.sizes.lg
  const precedingBase: 'brand-base' = defaults.precedingBase

  defaults.p('base', 'theme', 'brand', 'app', 'all')
  // @ts-expect-error Variant maps are not class strings.
  defaults.p('sizes')
  // @ts-expect-error The picker is not a class string.
  defaults.p('p')
  // @ts-expect-error Unknown class names must not silently widen to string.
  defaults.p('missing')
  // @ts-expect-error A replaced literal must not survive in the merged type.
  const oldBase: 'theme-base' = defaults.base

  return { base, inherited, branded, application, small, large, precedingBase, oldBase }
}

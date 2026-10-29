import type { IBtnProps } from '../../app/components/Button/types/btn-props.type'

type Defaults = Parameters<NonNullable<NonNullable<IBtnProps['ui']>['containerClass']>>[0]['defaults']

export function verifyStandaloneDefaults(defaults: Defaults) {
  const base: 'flex items-center tracking-wide relative select-none' = defaults.base
  defaults.p('base', 'bold', 'all')
  // @ts-expect-error Another app's class registry must not leak into this host.
  defaults.p('brand')
  // @ts-expect-error Variant maps are not selectable class strings.
  defaults.p('sizes')

  return base
}

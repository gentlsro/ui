import type { NavigationTarget } from '../../../types/navigation-target.type'
import type { NavigateToOptions } from '#layers/utilities/app/types/navigate-to.type'

// Shared UI must accept the consuming app's routes without embedding its
// generated route-name union in the layer's public types.
export type UILinkTarget = NavigationTarget

export type IUILinkProps = {
  to?: UILinkTarget | null
  href?: string
  disabled?: boolean
  external?: boolean
  download?: string | boolean
  replace?: boolean
  viewTransition?: boolean
  target?: string
  rel?: string | null
  noRel?: boolean
  activeClass?: string
  exactActiveClass?: string
  ariaCurrentValue?: 'page' | 'step' | 'location' | 'date' | 'time' | 'true' | 'false'
  exact?: boolean
  noActiveLink?: boolean
  navigateToOptions?: NavigateToOptions
  prefetch?: boolean
  noPrefetch?: boolean
  prefetchOn?: 'visibility' | 'interaction' | { visibility?: boolean, interaction?: boolean }
  prefetchedClass?: string
}

import type { UIClasses, UIResolvedClasses } from '../../../types/ui-config.type'
// Types
import type { IFloatingUIProps } from '../../../types/floating-ui-props.type'

// Constants
import type { BREAKPOINTS } from '../../../constants/breakpoints'
import type { MENU_PROXY_DEFAULT_PROPS } from '../constants/menu-proxy-default-props.constant'

export type IMenuProxyProps = Omit<IFloatingUIProps, 'ui'> & {
  breakpoint?: keyof typeof BREAKPOINTS
} & { ui?: UIClasses<NonNullable<(IFloatingUIProps)['ui']>, UIResolvedClasses['menuProxy']> }

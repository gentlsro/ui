// Types
import type { IFloatingUIProps } from '../../../types/floating-ui-props.type'

// Constants
import type { BREAKPOINTS } from '../../../../shared/constants/breakpoints'
import type { MENU_PROXY_DEFAULT_PROPS } from '../constants/menu-proxy-default-props.constant'

export type IMenuProxyProps = IFloatingUIProps & {
  breakpoint?: keyof typeof BREAKPOINTS
}

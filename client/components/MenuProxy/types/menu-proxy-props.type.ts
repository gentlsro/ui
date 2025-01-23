// Types
import type { IMenuProps } from '../../Menu/types/menu-props.type'
import type { IDialogProps } from '../../Dialog/types/dialog-props.type'
import type { BREAKPOINTS } from '../../../../shared/constants/breakpoints'

export type IMenuProxyProps = IDialogProps & IMenuProps & {
  breakpoint?: keyof typeof BREAKPOINTS
}

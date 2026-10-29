import type { UIClasses, UIResolvedClasses } from './ui-config.type'
// Types
import type { IDialogProps } from '../components/Dialog/types/dialog-props.type'
import type { IMenuProps } from '../components/Menu/types/menu-props.type'

export type IFloatingUIProps = Omit<IDialogProps, 'ui'> & Omit<IMenuProps, 'ui'> & {
  ui?: UIClasses<NonNullable<IDialogProps['ui']> & NonNullable<IMenuProps['ui']>, UIResolvedClasses['menuProxy']>
}

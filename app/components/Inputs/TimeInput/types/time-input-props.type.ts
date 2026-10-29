import type { UIClasses, UIResolvedClasses } from '../../../../types/ui-config.type'
// Types
import type { IInputProps } from '../../types/input-props.type'

export type ITimeInputShortcut = {
  label: string
  value: string
}

export type ITimeInputProps = Omit<IInputProps, 'ui'> & {
  /**
   * When true, the time input will not display an icon
   */
  noIcon?: boolean

  /**
   * The shortcuts
   */
  shortcuts?: ITimeInputShortcut[]
} & { ui?: UIClasses<NonNullable<(IInputProps)['ui']>, UIResolvedClasses['timeInput']> }

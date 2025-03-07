// Types
import type { IInputProps } from '../../types/input-props.type'

export type ITimeInputShortcut = {
  label: string
  value: string
}

export type ITimeInputProps = IInputProps & {
  /**
   * When true, the time input will not display an icon
   */
  noIcon?: boolean

  /**
   * The shortcuts
   */
  shortcuts?: ITimeInputShortcut[]
}

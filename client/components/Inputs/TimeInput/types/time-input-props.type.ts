// Types
import type { IInputProps } from '../../types/input-props.type'

export type ITimeInputShortcut = {
  label: string
  value: string
}

export type ITimeInputProps = IInputProps & {
  /**
   * The shortcuts
   */
  shortcuts?: ITimeInputShortcut[]
}

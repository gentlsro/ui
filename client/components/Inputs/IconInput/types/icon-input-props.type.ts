import type { CSSProperties } from 'vue'

// Types
import type { IInputProps } from '../../types/input-props.type'

export type IIconInputProps = IInputProps & {
  search?: string
  ui?: {
    searchClass?: ClassType
    searchStyle?: CSSProperties
    contentClass?: ClassType
    contentStyle?: CSSProperties
  }
}

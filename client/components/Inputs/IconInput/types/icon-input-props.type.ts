import type { CSSProperties } from 'vue'

// Types
import type { IInputProps } from '../../types/input-props.type'

export type IIconInputProps = IInputProps & {

  /**
   * The search string
   */
  search?: string

  /**
   * The minimum length of the search string
   */
  minSearchLength?: number

  /**
   * Visuals configuration
   */
  ui?: {
    searchClass?: ClassType
    searchStyle?: CSSProperties
    contentClass?: ClassType
    contentStyle?: CSSProperties
  }
}

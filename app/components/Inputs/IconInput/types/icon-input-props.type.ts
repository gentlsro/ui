import type { UIClasses, UIResolvedClasses } from '../../../../types/ui-config.type'
import type { CSSProperties } from 'vue'

// Types
import type { IInputProps } from '../../types/input-props.type'

export type IIconInputProps = Omit<IInputProps, 'ui'> & {

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
  ui?: UIClasses<NonNullable<(IInputProps)['ui']> & {
    searchClass?: ClassType
    searchStyle?: CSSProperties
    contentClass?: ClassType
    contentStyle?: CSSProperties
  }, UIResolvedClasses['iconInput']>
}

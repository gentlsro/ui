import type { UIClasses, UIResolvedClasses } from '../../../types/ui-config.type'
// Types
import type { IInputProps } from '../../Inputs/types/input-props.type'

export type IFieldProps = Omit<IInputProps, 'ui'> & {
  /**
   * The value
   */
  modelValue?: any

  /**
   * Flag to notify the component there is no content
   *
   * Takes precedence over `hasContent`
   */
  noContent?: boolean

  /**
   * Handling events
   */
  eventHandlers?: {
    /**
     * Function to call when the focus event is triggered
     * The additional `args` are dependent on the type of input
     *
     * (You probably don't want to use this)
     */
    onFocus?: (ev?: PointerEvent | FocusEvent, ...args: any[]) => void | undefined

    /**
     * Function to call before the focus event is triggered
     * The additional `args` are dependent on the type of input
     * You can return an object to customize the behavior
     */
    onBeforeFocus?: (
      ev?: PointerEvent | FocusEvent,
      ...args: any[]
    ) => { shouldFocus?: boolean, shouldHideFloating?: boolean } | undefined
  }
} & { ui?: UIClasses<NonNullable<(IInputProps)['ui']>, UIResolvedClasses['field']> }

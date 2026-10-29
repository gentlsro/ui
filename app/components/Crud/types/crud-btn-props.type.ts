import type { UIClassPicker, UIResolvedClasses } from '../../../types/ui-class-config.type'
import type { AllowedComponentProps, CSSProperties } from 'vue'

// Types
import type { IBtnProps } from '../../Button/types/btn-props.type'
import type { CrudAction } from './crud-action.type'

export type ICrudBtnProps = {
  /**
   * The props to pass to the button
   */
  btnProps?: Partial<IBtnProps> & AllowedComponentProps

  /**
   * Whether the button is disabled
   *
   * (Duplicate of the `btnProps.disabled` prop, but easier to use)
   */
  disabled?: IBtnProps['disabled']

  /**
   * The label of the button
   *
   * (Duplicate of the `btnProps.label` prop, but easier to use)
   */
  label?: IBtnProps['label']

  /**
   * Whether the button is loading
   *
   * (Duplicate of the `btnProps.loading` prop, but easier to use)
   */
  loading?: IBtnProps['loading']

  /**
   * When true, the label will not be shown
   */
  noLabel?: boolean
}

export type ICrudBtnsProps = {
  /**
   * Which actions to show
   */
  actions?: Partial<Record<CrudAction, boolean>> | true

  /**
   * The props to pass to the button
   */
  btnProps?: Partial<IBtnProps> & AllowedComponentProps

  /**
   * Whether to show labels
   */
  labels?: boolean

  /**
   * Whether the buttons are loading
   */
  loading?: boolean

  /**
   * Position of button confirmation
   */
  btnConfirmationPosition?: 'left' | 'right' | 'top' | 'bottom'

  /**
   * Visual configuration
   */
  ui?: {
    /**
     * Class to apply to the container
     */
    containerClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['crudBtns']['containerClass']>
    }) => ClassType

    /**
     * Style to apply to the container
     */
    containerStyle?: () => CSSProperties
  }
}

export type ICrudEditBtnProps = {
  /**
   * Whether the button is disabled
   */
  disabled?: boolean

  /**
   * Whether editing mode is enabled
   */
  editing?: boolean

  /**
   * The props to pass to the button
   */
  btnProps?: IBtnProps & AllowedComponentProps

  /**
   * Visual configuration
   */
  ui?: {
    /**
     * Class to apply to the wrapper
     */
    wrapperClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['crudEditBtn']['wrapperClass']>
    }) => ClassType

    /**
     * Style to apply to the wrapper
     */
    wrapperStyle?: () => CSSProperties

    /**
     * Class to apply to the button
     */
    btnClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['crudEditBtn']['btnClass']>
    }) => ClassType

    /**
     * Style to apply to the button
     */
    btnStyle?: () => CSSProperties
  }
}

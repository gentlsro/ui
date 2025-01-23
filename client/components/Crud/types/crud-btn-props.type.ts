// Types
import type { IBtnProps } from '../../Button/types/btn-props.type'

export type ICrudBtnProps = {
  /**
   * The props to pass to the button
   */
  btnProps?: Partial<IBtnProps>

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

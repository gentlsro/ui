import type { UIClassPicker, UIResolvedClasses } from '../../../types/ui-class-config.type'

export type IBurgerProps = {
  /**
   * Whether the burger menu is open (expanded state).
   */
  modelValue?: boolean

  /**
   * Size of the burger icon.
   * @default 'md'
   */
  size?: 'xs' | 'xm' | 'sm' | 'md' | 'lg'

  /**
   * Visual configuration
   */
  ui?: {
    /**
     * Class to apply to the wrapper button element
     */
    containerClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['burger']['containerClass']>
    }) => ClassType

    /**
     * Class to apply to the burger icon container
     */
    burgerClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['burger']['burgerClass']>
    }) => ClassType
  }
}

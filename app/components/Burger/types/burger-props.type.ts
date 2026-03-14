// Constants
import type { BURGER_DEFAULT_PROPS } from '../constants/burger-default-props.constant'

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
      defaults: ReturnType<typeof BURGER_DEFAULT_PROPS['ui']['containerClass']>
    }) => ClassType

    /**
     * Class to apply to the burger icon container
     */
    burgerClass?: (payload: {
      defaults: ReturnType<typeof BURGER_DEFAULT_PROPS['ui']['burgerClass']>
    }) => ClassType
  }
}

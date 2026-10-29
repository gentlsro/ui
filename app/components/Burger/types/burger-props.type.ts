import type { UIClasses, UIResolvedClasses } from '../../../types/ui-config.type'
import type { WithClassPicker } from '../../../functions/with-class-picker'
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
  ui?: UIClasses<{
    /**
     * Class to apply to the wrapper button element
     */
    containerClass?: (payload: WithClassPicker<{
      defaults: ReturnType<typeof BURGER_DEFAULT_PROPS['ui']['containerClass']>
    }>) => ClassType

    /**
     * Class to apply to the burger icon container
     */
    burgerClass?: (payload: WithClassPicker<{
      defaults: ReturnType<typeof BURGER_DEFAULT_PROPS['ui']['burgerClass']>
    }>) => ClassType
  }, UIResolvedClasses['burger']>
}

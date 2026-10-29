import type { UIClasses, UIResolvedClasses } from '../../../types/ui-config.type'
import type { WithClassPicker } from '../../../functions/with-class-picker'
import type { CSSProperties } from 'vue'

// Constants
import type { SEPARATOR_DEFAULT_PROPS } from '../constants/separator-default-props.constant'

export type ISeparatorProps = {
  /**
   * When true, some space will be added on both sides of the separator
   */
  spaced?: boolean

  /**
   * To indicate if the separator is vertical
   */
  vertical?: boolean

  /**
   * The separator will have some free space on its main axis
   */
  inset?: boolean

  /**
   * Visual configuration
   */
  ui?: UIClasses<{
    /**
     * Class to apply to the container
     */
    containerClass?: (payload: WithClassPicker<{
      defaults: ReturnType<typeof SEPARATOR_DEFAULT_PROPS['ui']['containerClass']>
    }>) => ClassType

    /**
     * Style to apply to the container
     */
    containerStyle?: () => CSSProperties
  }, UIResolvedClasses['separator']>
}

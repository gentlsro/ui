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
  ui?: {
    /**
     * Class to apply to the container
     */
    containerClass?: (payload: {
      defaults: ReturnType<typeof SEPARATOR_DEFAULT_PROPS['ui']['containerClass']>
    }) => ClassType

    /**
     * Style to apply to the container
     */
    containerStyle?: () => CSSProperties
  }
}

import type { UIClassPicker, UIResolvedClasses } from '../../../types/ui-class-config.type'
import type { CSSProperties } from 'vue'

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
      defaults: UIClassPicker<UIResolvedClasses['separator']['containerClass']>
    }) => ClassType

    /**
     * Style to apply to the container
     */
    containerStyle?: () => CSSProperties
  }
}

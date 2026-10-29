import type { UIClassPicker, UIResolvedClasses } from '../../../types/ui-class-config.type'
import type { CSSProperties } from 'vue'

export type IBadgeProps = {
  /**
   * The counter of the badge
   */
  counter?: number | string

  /**
   * Visual configuration
   */
  ui?: {
    /**
     * Class to apply to the badge
     */
    containerClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['badge']['containerClass']>
    }) => ClassType

    /**
     * Style to apply to the container
     */
    containerStyle?: () => CSSProperties
  }
}

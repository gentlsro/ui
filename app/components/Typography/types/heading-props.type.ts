import type { UIClassPicker, UIResolvedClasses } from '../../../types/ui-class-config.type'
import type { CSSProperties } from 'vue'

export type IHeadingProps = {
  /**
   * When true, the Heading will have a "filled" background, ie. `bg-ca` will be applied
   */
  filled?: boolean

  /**
   * When true:
   *  The filled title will have left highlight.
   *  The unfilled title will have bottom highlight
   */
  highlighted?: boolean

  ui?: {
    /**
     * Class for the container
     */
    containerClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['heading']['containerClass']>
    }) => ClassType

    /**
     * Style for the container
     */
    containerStyle?: () => CSSProperties
  }
}

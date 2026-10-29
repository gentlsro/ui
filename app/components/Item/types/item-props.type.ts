import type { CSSProperties } from 'vue'

// Constants
import type { ITEM_DEFAULT_PROPS } from '../constants/item-default-props.constant'

export type IItemProps = {
  /**
   * Whether the item is disabled
   */
  disabled?: boolean

  /**
   * When true, the item will not have the hover effect
   */
  noHoverEffect?: boolean

  /**
   * Whether the item is readonly
   */
  readonly?: boolean

  /**
   * The tag (HTML tag) of the item
   */
  tag?: string

  /**
   * Visual configuration
   */
  ui?: {
    /**
     * Class to apply to the container element
     */
    containerClass?: (payload: {
      defaults: ReturnType<typeof ITEM_DEFAULT_PROPS['ui']['containerClass']>
    }) => ClassType

    /**
     * Style to apply to the container element
     */
    containerStyle?: () => CSSProperties

    /**
     * Class to apply to the focus helper overlay
     */
    focusHelperClass?: (payload: {
      defaults: ReturnType<typeof ITEM_DEFAULT_PROPS['ui']['focusHelperClass']>
    }) => ClassType

    /**
     * Style to apply to the focus helper overlay
     */
    focusHelperStyle?: () => CSSProperties
  }
}

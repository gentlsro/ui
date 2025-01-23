import type { CSSProperties } from 'vue'

// Types
import type { IItemProps } from '../../Item/types/item-props.type'

export type ToggleState = 'checked' | 'unchecked' | 'indeterminate'

export type ToggleClass = Record<
  ToggleState,
  {
    toggle?: ClassType
    bullet?: ClassType
    icon?: ClassType
  }
>

export type IToggleProps = {
  /**
   * Whether the toggle allows string values for the check/uncheck values
   * So the string "true" would still be considered as a checked value.
   * @default true
   */
  allowString?: boolean

  /**
   * The value of the toggle when it's checked.
   * @default true
   */
  checkValue?: any

  /**
   * Visuals: Whether the toggle "bullet" is contained within the toggle.
   * @default true
   */
  contained?: boolean

  /**
   * Whether the toggle is disabled.
   * @default false
   */
  disabled?: boolean

  /**
   * When true, when you hover the bullet, it will get a shadow
   */
  hoverable?: boolean

  /**
   * When true, the toggle will allow the `indeterminate` state
   */
  allowIndeterminate?: boolean

  /**
   * The indeterminate value of the toggle.
   * @default null
   */
  indeterminateValue?: any

  /**
   * The toggle label
   */
  label?: string

  /**
   * The props for the `Item` that wraps the `Toggle`
   */
  itemProps?: IItemProps

  /**
   * The actual value of the toggle.
   */
  modelValue?: any

  /**
   * Whether the toggle is readonly.
   */
  readonly?: boolean

  /**
   * The size of the toggle.
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'auto'

  /**
   * The value of the toggle when it's unchecked.
   */
  uncheckValue?: any

  /**
   * Visual configuration
   */
  ui?: {

    /**
     * Class to apply to the toggle bullet (the circle)
     */
    bulletClass?: (state: ToggleState) => ClassType

    /**
     * Style to apply to the toggle bullet (the circle)
     */
    bulletStyle?: (state: ToggleState) => CSSProperties

    /**
     * Class to apply to the toggle label
     */
    labelClass?: ClassType

    /**
     * Style to apply to the toggle label
     */
    labelStyle?: CSSProperties

    /**
     * Class to apply to the toggle itself
     */
    toggleClass?: (state: ToggleState) => ClassType

    /**
     * Style to apply to the toggle itself
     */
    toggleStyle?: (state: ToggleState) => CSSProperties

    /**
     * The icon to use based on the state
     */
    icon?: (state: ToggleState) => ClassType
  }
}

export type IColorPickerProps = {
  /**
   * The model value (= color)
   */
  modelValue?: string

  /**
   * Whether to use RGBA values
   */
  rgba?: boolean

  /**
   * Whether to use tailwind colors
   */
  tw?: boolean

  /**
   * A list of colors that are not allowed to be selected
   */
  disallowedColors?: string[]
}

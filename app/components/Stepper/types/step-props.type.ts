export type IStepProps = {
  /**
   * Name of the step, used as the `Stepper`'s `modelValue`
   */
  name: string

  /**
   * Label of the step
   *
   * NOTE: Defaults to the `name`, use an empty string to show only the indicator
   */
  label?: string | (() => string)

  /**
   * Description of the step, shown below the label
   */
  description?: string | (() => string)

  /**
   * Icon shown in the step's indicator instead of its number
   *
   * NOTE: An Iconify name (`lucide:user`) or a UnoCSS icon class (`i-lucide:user`), like `Btn`'s `icon`
   */
  icon?: string

  /**
   * Whether the step cannot be selected
   */
  disabled?: boolean

  /**
   * Whether the step is in an error state
   */
  error?: boolean
}

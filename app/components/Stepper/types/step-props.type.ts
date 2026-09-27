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

import type { CSSProperties } from 'vue'

// Constants
import type { STEPPER_DEFAULT_PROPS } from '../constants/stepper-default-props.constant'

export type IStepperProps = {
  /**
   * The icon shown in the indicator of a completed step
   */
  completedIcon?: string

  /**
   * Whether all steps are disabled
   */
  disabled?: boolean

  /**
   * The icon shown in the indicator of a step in an error state
   */
  errorIcon?: string

  /**
   * Where the step's label and description are placed in relation to the indicator
   *
   * NOTE: Only applies to the `horizontal` orientation
   *
   * @default 'end'
   */
  labelPlacement?: 'end' | 'bottom'

  /**
   * When true, steps after the furthest reached one cannot be selected by clicking on them,
   * the user has to move forward using the exposed `next` method
   */
  linear?: boolean

  /**
   * Currently active step's name
   *
   * NOTE: When not provided, the first step is active
   */
  modelValue?: string

  /**
   * The orientation of the `Stepper`
   *
   * NOTE: In the `vertical` orientation, the content is rendered next to the navigation
   *
   * @default 'horizontal'
   */
  orientation?: 'horizontal' | 'vertical'

  /**
   * The size of the `Stepper`
   *
   * @default 'md'
   */
  size?: 'xs' | 'sm' | 'md' | 'lg'

  /**
   * Visual configuration
   *
   * NOTE: Use `is-active`, `is-completed`, `is-upcoming`, `is-error` and `is-disabled` CSS selectors for state styling,
   * the state classes are applied to the item, trigger, indicator, label and description
   */
  ui?: {
    /**
     * Class to apply to the container
     */
    containerClass?: (payload: {
      defaults: ReturnType<typeof STEPPER_DEFAULT_PROPS['ui']['containerClass']>
    }) => ClassType

    /**
     * Style to apply to the container
     */
    containerStyle?: () => CSSProperties

    /**
     * Class to apply to the navigation (the list of steps)
     */
    navigationClass?: (payload: {
      defaults: ReturnType<typeof STEPPER_DEFAULT_PROPS['ui']['navigationClass']>
    }) => ClassType

    /**
     * Style to apply to the navigation (the list of steps)
     */
    navigationStyle?: () => CSSProperties

    /**
     * Class to apply to each step in the navigation
     */
    itemClass?: (payload: {
      defaults: ReturnType<typeof STEPPER_DEFAULT_PROPS['ui']['itemClass']>
    }) => ClassType

    /**
     * Style to apply to each step in the navigation
     */
    itemStyle?: () => CSSProperties

    /**
     * Class to apply to the step's trigger (the clickable indicator and text)
     */
    triggerClass?: (payload: {
      defaults: ReturnType<typeof STEPPER_DEFAULT_PROPS['ui']['triggerClass']>
    }) => ClassType

    /**
     * Style to apply to the step's trigger (the clickable indicator and text)
     */
    triggerStyle?: () => CSSProperties

    /**
     * Class to apply to the step's indicator
     */
    indicatorClass?: (payload: {
      defaults: ReturnType<typeof STEPPER_DEFAULT_PROPS['ui']['indicatorClass']>
    }) => ClassType

    /**
     * Style to apply to the step's indicator
     */
    indicatorStyle?: () => CSSProperties

    /**
     * Class to apply to the icon inside the step's indicator
     */
    iconClass?: (payload: {
      defaults: ReturnType<typeof STEPPER_DEFAULT_PROPS['ui']['iconClass']>
    }) => ClassType

    /**
     * Style to apply to the icon inside the step's indicator
     */
    iconStyle?: () => CSSProperties

    /**
     * Class to apply to the separator between steps
     */
    separatorClass?: (payload: {
      defaults: ReturnType<typeof STEPPER_DEFAULT_PROPS['ui']['separatorClass']>
    }) => ClassType

    /**
     * Style to apply to the separator between steps
     */
    separatorStyle?: () => CSSProperties

    /**
     * Class to apply to the wrapper of the step's label and description
     */
    textClass?: (payload: {
      defaults: ReturnType<typeof STEPPER_DEFAULT_PROPS['ui']['textClass']>
    }) => ClassType

    /**
     * Style to apply to the wrapper of the step's label and description
     */
    textStyle?: () => CSSProperties

    /**
     * Class to apply to the step's label
     */
    labelClass?: (payload: {
      defaults: ReturnType<typeof STEPPER_DEFAULT_PROPS['ui']['labelClass']>
    }) => ClassType

    /**
     * Style to apply to the step's label
     */
    labelStyle?: () => CSSProperties

    /**
     * Class to apply to the step's description
     */
    descriptionClass?: (payload: {
      defaults: ReturnType<typeof STEPPER_DEFAULT_PROPS['ui']['descriptionClass']>
    }) => ClassType

    /**
     * Style to apply to the step's description
     */
    descriptionStyle?: () => CSSProperties

    /**
     * Class to apply to the wrapper of the steps' content
     */
    panelsClass?: (payload: {
      defaults: ReturnType<typeof STEPPER_DEFAULT_PROPS['ui']['panelsClass']>
    }) => ClassType

    /**
     * Style to apply to the wrapper of the steps' content
     */
    panelsStyle?: () => CSSProperties

    /**
     * Class to apply to the content of the active step (the `Step` component)
     */
    stepClass?: (payload: {
      defaults: ReturnType<typeof STEPPER_DEFAULT_PROPS['ui']['stepClass']>
    }) => ClassType

    /**
     * Style to apply to the content of the active step (the `Step` component)
     */
    stepStyle?: () => CSSProperties
  }
}

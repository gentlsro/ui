import type { UIClassPicker, UIResolvedClasses } from '../../../types/ui-class-config.type'
import type { CSSProperties } from 'vue'

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
      defaults: UIClassPicker<UIResolvedClasses['stepper']['containerClass']>
    }) => ClassType

    /**
     * Style to apply to the container
     */
    containerStyle?: () => CSSProperties

    /**
     * Class to apply to the navigation (the list of steps)
     */
    navigationClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['stepper']['navigationClass']>
    }) => ClassType

    /**
     * Style to apply to the navigation (the list of steps)
     */
    navigationStyle?: () => CSSProperties

    /**
     * Class to apply to each step in the navigation
     */
    itemClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['stepper']['itemClass']>
    }) => ClassType

    /**
     * Style to apply to each step in the navigation
     */
    itemStyle?: () => CSSProperties

    /**
     * Class to apply to the step's trigger (the clickable indicator and text)
     */
    triggerClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['stepper']['triggerClass']>
    }) => ClassType

    /**
     * Style to apply to the step's trigger (the clickable indicator and text)
     */
    triggerStyle?: () => CSSProperties

    /**
     * Class to apply to the step's indicator
     */
    indicatorClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['stepper']['indicatorClass']>
    }) => ClassType

    /**
     * Style to apply to the step's indicator
     */
    indicatorStyle?: () => CSSProperties

    /**
     * Class to apply to the icon inside the step's indicator
     */
    iconClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['stepper']['iconClass']>
    }) => ClassType

    /**
     * Style to apply to the icon inside the step's indicator
     */
    iconStyle?: () => CSSProperties

    /**
     * Class to apply to the separator between steps
     */
    separatorClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['stepper']['separatorClass']>
    }) => ClassType

    /**
     * Style to apply to the separator between steps
     */
    separatorStyle?: () => CSSProperties

    /**
     * Class to apply to the wrapper of the step's label and description
     */
    textClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['stepper']['textClass']>
    }) => ClassType

    /**
     * Style to apply to the wrapper of the step's label and description
     */
    textStyle?: () => CSSProperties

    /**
     * Class to apply to the step's label
     */
    labelClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['stepper']['labelClass']>
    }) => ClassType

    /**
     * Style to apply to the step's label
     */
    labelStyle?: () => CSSProperties

    /**
     * Class to apply to the step's description
     */
    descriptionClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['stepper']['descriptionClass']>
    }) => ClassType

    /**
     * Style to apply to the step's description
     */
    descriptionStyle?: () => CSSProperties

    /**
     * Class to apply to the wrapper of the steps' content
     */
    panelsClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['stepper']['panelsClass']>
    }) => ClassType

    /**
     * Style to apply to the wrapper of the steps' content
     */
    panelsStyle?: () => CSSProperties

    /**
     * Class to apply to the content of the active step (the `Step` component)
     */
    stepClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['stepper']['stepClass']>
    }) => ClassType

    /**
     * Style to apply to the content of the active step (the `Step` component)
     */
    stepStyle?: () => CSSProperties
  }
}

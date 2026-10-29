import type { UIClassPicker, UIResolvedClasses } from '../../../types/ui-class-config.type'
import type { CSSProperties } from 'vue'

export type IProgressBarProps = {
  /**
   * The progress of the progress bar
   */
  progress?: number

  /**
   * The label of the progress bar
   */
  label: string | ((progress?: number) => string) | false

  /**
   * Visual configuration
   */
  ui?: {
    /**
     * Class to apply to the container
     */
    containerClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['progressBar']['containerClass']>
    }) => ClassType

    /**
     * Style to apply to the container
     */
    containerStyle?: () => CSSProperties

    /**
     * Class to apply to inner elements
     */
    innerClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['progressBar']['innerClass']>
    }) => ClassType

    /**
     * Style to apply to inner elements
     */
    innerStyle?: () => CSSProperties

    /**
     * Class to apply to the color overlay
     */
    colorClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['progressBar']['colorClass']>
    }) => ClassType

    /**
     * Style to apply to the color overlay
     */
    colorStyle?: () => CSSProperties

    /**
     * Class to apply to the white background
     */
    whiteBgClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['progressBar']['whiteBgClass']>
    }) => ClassType

    /**
     * Style to apply to the white background
     */
    whiteBgStyle?: () => CSSProperties

    /**
     * Class to apply to the black background (progress indicator)
     */
    blackBgClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['progressBar']['blackBgClass']>
    }) => ClassType

    /**
     * Style to apply to the black background (progress indicator)
     */
    blackBgStyle?: () => CSSProperties

    /**
     * Class to apply to the text
     */
    textClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['progressBar']['textClass']>
    }) => ClassType

    /**
     * Style to apply to the text
     */
    textStyle?: () => CSSProperties
  }
}

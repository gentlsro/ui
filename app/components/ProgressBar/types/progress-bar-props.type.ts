import type { CSSProperties } from 'vue'

// Constants
import type { PROGRESS_BAR_DEFAULT_PROPS } from '../constants/progress-bar-default-props.constant'

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
      defaults: ReturnType<typeof PROGRESS_BAR_DEFAULT_PROPS['ui']['containerClass']>
    }) => ClassType

    /**
     * Style to apply to the container
     */
    containerStyle?: () => CSSProperties

    /**
     * Class to apply to inner elements
     */
    innerClass?: (payload: {
      defaults: ReturnType<typeof PROGRESS_BAR_DEFAULT_PROPS['ui']['innerClass']>
    }) => ClassType

    /**
     * Style to apply to inner elements
     */
    innerStyle?: () => CSSProperties

    /**
     * Class to apply to the color overlay
     */
    colorClass?: (payload: {
      defaults: ReturnType<typeof PROGRESS_BAR_DEFAULT_PROPS['ui']['colorClass']>
    }) => ClassType

    /**
     * Style to apply to the color overlay
     */
    colorStyle?: () => CSSProperties

    /**
     * Class to apply to the white background
     */
    whiteBgClass?: (payload: {
      defaults: ReturnType<typeof PROGRESS_BAR_DEFAULT_PROPS['ui']['whiteBgClass']>
    }) => ClassType

    /**
     * Style to apply to the white background
     */
    whiteBgStyle?: () => CSSProperties

    /**
     * Class to apply to the black background (progress indicator)
     */
    blackBgClass?: (payload: {
      defaults: ReturnType<typeof PROGRESS_BAR_DEFAULT_PROPS['ui']['blackBgClass']>
    }) => ClassType

    /**
     * Style to apply to the black background (progress indicator)
     */
    blackBgStyle?: () => CSSProperties

    /**
     * Class to apply to the text
     */
    textClass?: (payload: {
      defaults: ReturnType<typeof PROGRESS_BAR_DEFAULT_PROPS['ui']['textClass']>
    }) => ClassType

    /**
     * Style to apply to the text
     */
    textStyle?: () => CSSProperties
  }
}

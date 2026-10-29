import type { CSSProperties } from 'vue'

// Types
import type { CIRCLE_PROGRESS_DEFAULT_PROPS } from '../constants/circle-progress-default-props.constant'

export type ICircleProgressProps = {
  /**
   * Progress value
   */
  progress: number

  /**
   * Circle size in pixels
   */
  size?: number

  /**
   * Stroke color
   *
   * NOTE: use `stroke-red` and similar for UnoCSS to apply the color
   */
  color?: string

  /**
   * When true, the progress text is not shown
   */
  noProgressText?: boolean

  ui?: {
    containerClass?: (payload: {
      defaults: ReturnType<typeof CIRCLE_PROGRESS_DEFAULT_PROPS['ui']['containerClass']>
    }) => ClassType

    containerStyle?: () => CSSProperties

    svgClass?: (payload: {
      defaults: ReturnType<typeof CIRCLE_PROGRESS_DEFAULT_PROPS['ui']['svgClass']>
    }) => ClassType

    svgStyle?: () => CSSProperties

    circleBgClass?: (payload: {
      defaults: ReturnType<typeof CIRCLE_PROGRESS_DEFAULT_PROPS['ui']['circleBgClass']>
    }) => ClassType

    circleBgStyle?: () => CSSProperties

    circleClass?: (payload: {
      defaults: ReturnType<typeof CIRCLE_PROGRESS_DEFAULT_PROPS['ui']['circleClass']>
    }) => ClassType

    circleStyle?: () => CSSProperties

    textClass?: (payload: {
      defaults: ReturnType<typeof CIRCLE_PROGRESS_DEFAULT_PROPS['ui']['textClass']>
    }) => ClassType

    textStyle?: () => CSSProperties
  }
}

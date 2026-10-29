import type { UIClassPicker, UIResolvedClasses } from '../../../types/ui-class-config.type'
import type { CSSProperties } from 'vue'

// Types

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
      defaults: UIClassPicker<UIResolvedClasses['circleProgress']['containerClass']>
    }) => ClassType

    containerStyle?: () => CSSProperties

    svgClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['circleProgress']['svgClass']>
    }) => ClassType

    svgStyle?: () => CSSProperties

    circleBgClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['circleProgress']['circleBgClass']>
    }) => ClassType

    circleBgStyle?: () => CSSProperties

    circleClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['circleProgress']['circleClass']>
    }) => ClassType

    circleStyle?: () => CSSProperties

    textClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['circleProgress']['textClass']>
    }) => ClassType

    textStyle?: () => CSSProperties
  }
}

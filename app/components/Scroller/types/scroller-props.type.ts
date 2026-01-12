import type { CSSProperties } from 'vue'
import type { SCROLLER_DEFAULT_PROPS } from '../constants/scroller-default-props.constant'

type IScrollerBaseProps = {
  /**
   * When `arrows` is outside, the `Scroller` will create space on each side to fit the arrows
   * When `arrows` is inside, that arrows will be absolutely positioned in the scroller
   */
  arrows?: 'outside' | 'inside'

  /**
   * The scroll position
   */
  scrollPosition?: number
}

export type IHorizontalScrollerProps = IScrollerBaseProps & {
  ui?: {
    /**
     * Class to apply to the container
     */
    containerClass?: (payload: {
      defaults: ReturnType<typeof SCROLLER_DEFAULT_PROPS['ui']['horizontalContainerClass']>
    }) => ClassType

    /**
     * Style to apply to the container
     */
    containerStyle?: () => CSSProperties

    /**
     * Class to apply to the content
     */
    contentClass?: (payload: {
      defaults: ReturnType<typeof SCROLLER_DEFAULT_PROPS['ui']['contentClass']>
    }) => ClassType

    /**
     * Style to apply to the content
     */
    contentStyle?: () => CSSProperties

    arrowClass?: (payload: {
      defaults: ReturnType<typeof SCROLLER_DEFAULT_PROPS['ui']['arrowClass']>
    }) => ClassType

    arrowStyle?: () => CSSProperties
  }
}

export type IVerticalScrollerProps = IScrollerBaseProps & {
  ui?: {
    /**
     * Class to apply to the container
     */
    containerClass?: (payload: {
      defaults: ReturnType<typeof SCROLLER_DEFAULT_PROPS['ui']['verticalContainerClass']>
    }) => ClassType

    /**
     * Style to apply to the container
     */
    containerStyle?: () => CSSProperties

    /**
     * Class to apply to the content
     */
    contentClass?: (payload: {
      defaults: ReturnType<typeof SCROLLER_DEFAULT_PROPS['ui']['verticalContentClass']>
    }) => ClassType

    /**
     * Style to apply to the content
     */
    contentStyle?: () => CSSProperties

    /**
     * Class to apply to the arrow
     */
    arrowClass?: (payload: {
      defaults: ReturnType<typeof SCROLLER_DEFAULT_PROPS['ui']['arrowClass']>
    }) => ClassType

    arrowStyle?: () => CSSProperties
  }
}

// Backwards compatibility alias
export type IScrollerProps = IHorizontalScrollerProps & IVerticalScrollerProps

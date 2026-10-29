import type { UIClassPicker, UIResolvedClasses } from '../../../types/ui-class-config.type'
import type { CSSProperties } from 'vue'

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
  /** Disable vertical-wheel conversion to horizontal scrolling. Native horizontal gestures still work. */
  noWheelScroll?: boolean

  ui?: {
    /**
     * Class to apply to the container
     */
    containerClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['horizontalScroller']['containerClass']>
    }) => ClassType

    /**
     * Style to apply to the container
     */
    containerStyle?: () => CSSProperties

    /**
     * Class to apply to the content
     */
    contentClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['horizontalScroller']['contentClass']>
    }) => ClassType

    /**
     * Style to apply to the content. Customize the mask with `--scroll-fade-size`,
     * `--scroll-fade-s-size`, `--scroll-fade-e-size`, and `--scroll-fade-reveal`.
     * Set `--scroll-fade-mask: none` to disable the fade.
     */
    contentStyle?: () => CSSProperties

    arrowClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['horizontalScroller']['arrowClass']>
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
      defaults: UIClassPicker<UIResolvedClasses['verticalScroller']['containerClass']>
    }) => ClassType

    /**
     * Style to apply to the container
     */
    containerStyle?: () => CSSProperties

    /**
     * Class to apply to the content
     */
    contentClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['verticalScroller']['contentClass']>
    }) => ClassType

    /**
     * Style to apply to the content. Customize the mask with `--scroll-fade-size`,
     * `--scroll-fade-t-size`, `--scroll-fade-b-size`, and `--scroll-fade-reveal`.
     * Set `--scroll-fade-mask: none` to disable the fade.
     */
    contentStyle?: () => CSSProperties

    /**
     * Class to apply to the arrow
     */
    arrowClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['verticalScroller']['arrowClass']>
    }) => ClassType

    arrowStyle?: () => CSSProperties
  }
}

// Backwards compatibility alias
export type IScrollerProps = IHorizontalScrollerProps & IVerticalScrollerProps

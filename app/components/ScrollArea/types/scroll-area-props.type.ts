import type PerfectScrollbar from 'perfect-scrollbar'
import type { CSSProperties } from 'vue'
import type { SCROLL_AREA_DEFAULT_PROPS } from '../constants/scroll-area-default-props.constant'

export type IScrollAreaProps = {
  /**
   * The `perfect-scrollbar` options
   */
  options?: PerfectScrollbar.Options

  /**
   * By default, the scroll area is initialized only after transitions in parent
   * elements have finished. Setting this to `true` will initialize the scroll area immediately.
   */
  immediate?: boolean

  ui?: {
    containerClass?: (payload: {
      defaults: ReturnType<typeof SCROLL_AREA_DEFAULT_PROPS['ui']['containerClass']>
    }) => ClassType

    containerStyle?: () => CSSProperties
  }
}

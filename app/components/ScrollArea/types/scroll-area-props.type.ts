import type { UIClassPicker, UIResolvedClasses } from '../../../types/ui-class-config.type'
import type PerfectScrollbar from 'perfect-scrollbar'
import type { CSSProperties } from 'vue'

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
      defaults: UIClassPicker<UIResolvedClasses['scrollArea']['containerClass']>
    }) => ClassType

    containerStyle?: () => CSSProperties
  }
}

import type PerfectScrollbar from 'perfect-scrollbar'

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
}

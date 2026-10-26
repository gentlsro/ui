// Types
import type { IBtnProps } from '../../Button/types/btn-props.type'

export type ITabProps = {
  name: string

  /**
   * Label for the tab
   *
   * NOTE: This is basically the same as `btnProps.label` but just exposed for convenience
   */
  label?: string | (() => string)

  /**
   * Icon for the tab
   *
   * NOTE: This is basically the same as `btnProps.icon` but just exposed for convenience
   */
  icon?: string

  /**
   * Cache this tab without requiring global keepAliveProps. False opts out of
   * the global cache; undefined follows it. Global include/exclude/max still apply.
   */
  keepAlive?: boolean

  /**
   * The props that should be passed to the button
   */
  btnProps?: (isActive: boolean, idx: number) => Partial<IBtnProps>
}

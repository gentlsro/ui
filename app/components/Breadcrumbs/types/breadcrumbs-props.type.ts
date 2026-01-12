import type { CSSProperties } from 'vue'

// Types
import type { IBreadcrumb } from './breadcrumb.type'

// Constants
import type { BREADCRUMBS_DEFAULT_PROPS } from '../constants/breadcrumbs-default-props.constant'

export type IBreadcrumbsProps = {
  /**
   * Path to the home page
   */
  homePath?: string | (() => string)

  /**
   * Breadcrumbs
   *
   * NOTE: These will take priority over `useBreadcrumbs`
   */
  breadcrumbs?: IBreadcrumb[]

  /**
   * Visual configuration
   */
  ui?: {
    /**
     * Class to apply to the breadcrumbs wrapper
     */
    containerClass?: (payload: {
      defaults: ReturnType<typeof BREADCRUMBS_DEFAULT_PROPS['ui']['containerClass']>
    }) => ClassType

    /**
     * Style to apply to the breadcrumbs wrapper
     */
    containerStyle?: () => CSSProperties

    /**
     * Class to apply to the breadcrumbs
     */
    breadcrumbsClass?: (payload: {
      defaults: ReturnType<typeof BREADCRUMBS_DEFAULT_PROPS['ui']['breadcrumbsClass']>
    }) => ClassType

    /**
     * Style to apply to the breadcrumbs
     */
    breadcrumbsStyle?: () => CSSProperties
  }
}

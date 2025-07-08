import type { CSSProperties } from 'vue'
import type { IBreadcrumb } from '~~/libs/UI/client/components/Breadcrumbs/types/breadcrumb.type'

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
    wrapperClass?: ClassType

    /**
     * Style to apply to the breadcrumbs wrapper
     */
    wrapperStyle?: CSSProperties

    /**
     * Class to apply to the breadcrumbs
     */
    breadcrumbsClass?: ClassType

    /**
     * Style to apply to the breadcrumbs
     */
    breadcrumbsStyle?: CSSProperties
  }
}

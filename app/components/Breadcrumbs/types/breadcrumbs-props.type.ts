import type { UIClassPicker, UIResolvedClasses } from '../../../types/ui-class-config.type'
import type { CSSProperties } from 'vue'

// Types
import type { IBreadcrumb } from './breadcrumb.type'

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
      defaults: UIClassPicker<UIResolvedClasses['breadcrumbs']['containerClass']>
    }) => ClassType

    /**
     * Style to apply to the breadcrumbs wrapper
     */
    containerStyle?: () => CSSProperties

    /**
     * Class to apply to the breadcrumbs
     */
    breadcrumbsClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['breadcrumbs']['breadcrumbsClass']>
    }) => ClassType

    /**
     * Style to apply to the breadcrumbs
     */
    breadcrumbsStyle?: () => CSSProperties
  }
}

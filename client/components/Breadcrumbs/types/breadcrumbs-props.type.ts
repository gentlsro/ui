import type { CSSProperties } from 'vue'

export type IBreadcrumbsProps = {
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

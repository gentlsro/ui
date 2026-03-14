import type { CSSProperties } from 'vue'

// Types
import type { IPageTitleProps } from './page-title-props.type'

// Constants
import type { PAGE_WRAPPER_DEFAULT_PROPS } from '../constants/page-wrapper-default-props.constant'

export type IPageWrapperProps = {
  /**
   * Whether the breadcrumbs should be shown
   */
  breadcrumbs?: boolean

  /**
   * If true, Loading component will be shown instead of the page content
   */
  loading?: boolean

  /**
   * When true, the page content will be moved (via `transform`) to the right
   * instead of being under the sidebar
   */
  moveContent?: boolean

  /**
   * If true, the page will include margin-top corresponding to the navigation height
   *
   * @default true
   */
  pad?: boolean

  /**
   * The props that should be passed to the PageTitle
   */
  pageTitleProps?: Partial<IPageTitleProps>

  ui?: {
    /**
     * Class to apply to the container
     */
    containerClass?: (payload: {
      defaults: ReturnType<typeof PAGE_WRAPPER_DEFAULT_PROPS['ui']['containerClass']>
    }) => ClassType

    /**
     * Style to apply to the container
     */
    containerStyle?: () => CSSProperties

    /**
     * Class to apply to the content
     */
    contentClass?: (payload: {
      defaults: ReturnType<typeof PAGE_WRAPPER_DEFAULT_PROPS['ui']['contentClass']>
    }) => ClassType

    /**
     * Style to apply to the content
     */
    contentStyle?: () => CSSProperties
  }
}

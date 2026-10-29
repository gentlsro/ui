import type { CSSProperties } from 'vue'

// Constants
import type { PAGE_TITLE_DEFAULT_PROPS } from '../constants/page-title-default-props.constant'

export type IPageTitleProps = {
  /**
   * The page title
   */
  title?: string | (() => string)

  /**
   * Visual configuration
   */
  ui?: {
    /**
     * Class to apply to the container
     */
    containerClass?: (payload: {
      defaults: ReturnType<typeof PAGE_TITLE_DEFAULT_PROPS['ui']['containerClass']>
    }) => ClassType

    /**
     * Style to apply to the container
     */
    containerStyle?: () => CSSProperties

    /**
     * Class to apply to the page-title element
     */
    pageTitleClass?: (payload: {
      defaults: ReturnType<typeof PAGE_TITLE_DEFAULT_PROPS['ui']['pageTitleClass']>
    }) => ClassType

    /**
     * Style to apply to the page-title element
     */
    pageTitleStyle?: () => CSSProperties

    /**
     * Class to apply to the title
     */
    titleClass?: (payload: {
      defaults: ReturnType<typeof PAGE_TITLE_DEFAULT_PROPS['ui']['titleClass']>
    }) => ClassType

    /**
     * Style to apply to the title
     */
    titleStyle?: () => CSSProperties
  }
}

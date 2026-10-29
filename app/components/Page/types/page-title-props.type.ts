import type { UIClassPicker, UIResolvedClasses } from '../../../types/ui-class-config.type'
import type { CSSProperties } from 'vue'

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
      defaults: UIClassPicker<UIResolvedClasses['pageTitle']['containerClass']>
    }) => ClassType

    /**
     * Style to apply to the container
     */
    containerStyle?: () => CSSProperties

    /**
     * Class to apply to the page-title element
     */
    pageTitleClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['pageTitle']['pageTitleClass']>
    }) => ClassType

    /**
     * Style to apply to the page-title element
     */
    pageTitleStyle?: () => CSSProperties

    /**
     * Class to apply to the title
     */
    titleClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['pageTitle']['titleClass']>
    }) => ClassType

    /**
     * Style to apply to the title
     */
    titleStyle?: () => CSSProperties
  }
}

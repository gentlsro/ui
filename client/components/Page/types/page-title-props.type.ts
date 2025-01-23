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
    containerClass?: ClassType

    /**
     * Style to apply to the container
     */
    containerStyle?: CSSProperties

    /**
     * Class to apply to the title
     */
    titleClass?: ClassType

    /**
     * Style to apply to the title
     */
    titleStyle?: CSSProperties
  }
}

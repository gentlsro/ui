import type { CSSProperties } from 'vue'

// Types
import type { IHeadingProps } from '../../Typography/types/heading-props.type'

// Constants
import type { SECTION_DEFAULT_PROPS } from '../constants/section-default-props.constant'

export type ISectionProps = {
  /**
   * When true, the section will have a border.
   */
  bordered?: boolean

  /**
   * When true, no padding will be applied to the section.
   */
  dense?: boolean

  /**
   * The props to pass to the heading
   */
  headingProps?: Partial<IHeadingProps>

  /**
   * The subtitle of the section
   */
  subtitle?: string | number | false | null

  /**
   * The title of the section
   */
  title?: string | number | false | null

  /**
   * The element to use for the header
   */
  titleElement?: 'h6' | 'h5' | 'h4' | 'h3' | 'h2' | 'h1' | string

  /**
   * Visual configuration
   */
  ui?: {
    /**
     * Class for the container
     */
    containerClass?: (payload: {
      defaults: ReturnType<typeof SECTION_DEFAULT_PROPS['ui']['containerClass']>
    }) => ClassType

    /**
     * Style for the container
     */
    containerStyle?: () => CSSProperties

    /**
     * Class for the content
     */
    contentClass?: (payload: {
      defaults: ReturnType<typeof SECTION_DEFAULT_PROPS['ui']['contentClass']>
    }) => ClassType

    /**
     * Style for the content
     */
    contentStyle?: () => CSSProperties

    /**
     * Class for the title
     */
    titleClass?: (payload: {
      defaults: ReturnType<typeof SECTION_DEFAULT_PROPS['ui']['titleClass']>
    }) => ClassType

    /**
     * Style for the title
     */
    titleStyle?: () => CSSProperties

    /**
     * Class for the subtitle
     */
    subtitleClass?: (payload: {
      defaults: ReturnType<typeof SECTION_DEFAULT_PROPS['ui']['subtitleClass']>
    }) => ClassType

    /**
     * Style for the subtitle
     */
    subtitleStyle?: () => CSSProperties
  }
}

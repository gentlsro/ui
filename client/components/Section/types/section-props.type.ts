import type { CSSProperties } from 'vue'

// Types
import type { IHeadingProps } from '../../Typography/types/heading-props.type'

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
     * Class to apply to the content
     */
    contentClass?: ClassType

    /**
     * Style to apply to the content
     */
    contentStyle?: ClassType

    /**
     * Class to apply to the `title`
     */
    titleClass?: ClassType

    /**
     * Style to apply to the `title`
     */
    titleStyle?: CSSProperties

    /**
     * Style to apply to the `subtitle`
     */
    subtitleClass?: ClassType

    /**
     * Style to apply to the `subtitle`
     */
    subtitleStyle?: CSSProperties

    /**
     * Class to apply to the content
     */
    sectionClass?: ClassType

    /**
     * Style to apply to the content
     */
    sectionStyle?: CSSProperties
  }
}

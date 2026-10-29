import type { UIClasses, UIResolvedClasses } from '../../../types/ui-config.type'
import type { WithClassPicker } from '../../../functions/with-class-picker'
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
   * Flag to indicate if the section is loading
   */
  loading?: boolean

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
  ui?: UIClasses<{
    /**
     * Class for the container
     */
    containerClass?: (payload: WithClassPicker<{
      defaults: ReturnType<typeof SECTION_DEFAULT_PROPS['ui']['containerClass']>
    }>) => ClassType

    /**
     * Style for the container
     */
    containerStyle?: () => CSSProperties

    /**
     * Class for the content
     */
    contentClass?: (payload: WithClassPicker<{
      defaults: ReturnType<typeof SECTION_DEFAULT_PROPS['ui']['contentClass']>
    }>) => ClassType

    /**
     * Style for the content
     */
    contentStyle?: () => CSSProperties

    /**
     * Class for the title
     */
    titleClass?: (payload: WithClassPicker<{
      defaults: ReturnType<typeof SECTION_DEFAULT_PROPS['ui']['titleClass']>
    }>) => ClassType

    /**
     * Style for the title
     */
    titleStyle?: () => CSSProperties

    /**
     * Class for the subtitle
     */
    subtitleClass?: (payload: WithClassPicker<{
      defaults: ReturnType<typeof SECTION_DEFAULT_PROPS['ui']['subtitleClass']>
    }>) => ClassType

    /**
     * Style for the subtitle
     */
    subtitleStyle?: () => CSSProperties

    /**
     * Class for the loading state
     */
    loadingClass?: (payload: WithClassPicker<{
      defaults: ReturnType<typeof SECTION_DEFAULT_PROPS['ui']['loadingClass']>
    }>) => ClassType

    /**
     * Style for the loading state
     */
    loadingStyle?: () => CSSProperties
  }, UIResolvedClasses['section']>
}

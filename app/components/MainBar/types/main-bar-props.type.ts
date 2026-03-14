import type { CSSProperties } from 'vue'

// Types
import type { CrudAction } from '../../Crud/types/crud-action.type'
import type { IHeadingProps } from '../../Typography/types/heading-props.type'

// Constants
import type { MAIN_BAR_DEFAULT_PROPS } from '../constants/main-bar-default-props.constant'

export type IMainBarProps = {
  /**
   * Actions to show in the main bar
   */
  actions?: Partial<Record<CrudAction, boolean>> | true

  /**
   * Whether the main bar is loading
   */
  loading?: boolean

  /**
   * When true, no breadcrumbs will be shown
   */
  noBreadcrumbs?: boolean

  /**
   * Subtitle of the main bar
   */
  subtitle?: string

  /**
   * Title of the main bar
   */
  title: string

  /**
   * When true, the title will be truncated
   */
  titleTruncate?: boolean

  /**
   * The props to pass to the heading
   */
  headingProps?: Partial<IHeadingProps>

  /**
   * Visual configuration
   */
  ui?: {
    /**
     * Class to apply to the container
     */
    containerClass?: (payload: {
      defaults: ReturnType<typeof MAIN_BAR_DEFAULT_PROPS['ui']['containerClass']>
    }) => ClassType

    /**
     * Style to apply to the container
     */
    containerStyle?: () => CSSProperties

    /**
     * Class to apply to the content wrapper
     */
    contentClass?: (payload: {
      defaults: ReturnType<typeof MAIN_BAR_DEFAULT_PROPS['ui']['contentClass']>
    }) => ClassType

    /**
     * Style to apply to the content wrapper
     */
    contentStyle?: () => CSSProperties

    /**
     * Class to apply to the title wrapper
     */
    titleWrapperClass?: (payload: {
      defaults: ReturnType<typeof MAIN_BAR_DEFAULT_PROPS['ui']['titleWrapperClass']>
    }) => ClassType

    /**
     * Style to apply to the title wrapper
     */
    titleWrapperStyle?: () => CSSProperties

    /**
     * Class to apply to the title (Heading component)
     */
    titleClass?: (payload: {
      defaults: ReturnType<typeof MAIN_BAR_DEFAULT_PROPS['ui']['titleClass']>
    }) => ClassType

    /**
     * Style to apply to the title
     */
    titleStyle?: () => CSSProperties

    /**
     * Class to apply to the subtitle
     */
    subtitleClass?: (payload: {
      defaults: ReturnType<typeof MAIN_BAR_DEFAULT_PROPS['ui']['subtitleClass']>
    }) => ClassType

    /**
     * Style to apply to the subtitle
     */
    subtitleStyle?: () => CSSProperties

    /**
     * Class to apply to the actions wrapper
     */
    actionsClass?: (payload: {
      defaults: ReturnType<typeof MAIN_BAR_DEFAULT_PROPS['ui']['actionsClass']>
    }) => ClassType

    /**
     * Style to apply to the actions wrapper
     */
    actionsStyle?: () => CSSProperties
  }
}

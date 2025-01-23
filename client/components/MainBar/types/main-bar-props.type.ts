// Types
import type { CrudAction } from '../../Crud/types/crud-action.type'
import type { IHeadingProps } from '../../Typography/types/heading-props.type'

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

  ui?: {
    /**
     * Class to apply to the `subtitle`
     */
    subtitleClass?: ClassType

    /**
     * Style to apply to the `subtitle`
     */
    subtitleStyle?: ClassType

    /**
     * Class to apply to the `title`
     */
    titleClass?: ClassType

    /**
     * Style to apply to the `title`
     */
    titleStyle?: ClassType
  }
}

import type { UIClassPicker, UIResolvedClasses } from '../../../types/ui-class-config.type'
import type { CSSProperties } from 'vue'

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

  /**
   * Visual configuration
   */
  ui?: {
    /**
     * Class to apply to the container
     */
    containerClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['mainBar']['containerClass']>
    }) => ClassType

    /**
     * Style to apply to the container
     */
    containerStyle?: () => CSSProperties

    /**
     * Class to apply to the content wrapper
     */
    contentClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['mainBar']['contentClass']>
    }) => ClassType

    /**
     * Style to apply to the content wrapper
     */
    contentStyle?: () => CSSProperties

    /**
     * Class to apply to the title wrapper
     */
    titleWrapperClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['mainBar']['titleWrapperClass']>
    }) => ClassType

    /**
     * Style to apply to the title wrapper
     */
    titleWrapperStyle?: () => CSSProperties

    /**
     * Class to apply to the title (Heading component)
     */
    titleClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['mainBar']['titleClass']>
    }) => ClassType

    /**
     * Style to apply to the title
     */
    titleStyle?: () => CSSProperties

    /**
     * Class to apply to the subtitle
     */
    subtitleClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['mainBar']['subtitleClass']>
    }) => ClassType

    /**
     * Style to apply to the subtitle
     */
    subtitleStyle?: () => CSSProperties

    /**
     * Class to apply to the actions wrapper
     */
    actionsClass?: (payload: {
      defaults: UIClassPicker<UIResolvedClasses['mainBar']['actionsClass']>
    }) => ClassType

    /**
     * Style to apply to the actions wrapper
     */
    actionsStyle?: () => CSSProperties
  }
}

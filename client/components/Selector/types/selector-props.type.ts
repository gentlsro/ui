import type { AllowedComponentProps, CSSProperties } from 'vue'
import type { RouteLocationRaw } from '#vue-router'

// Types
import type { IListProps } from '../../List/types/list-props.type'
import type { IMenuProps } from '../../Menu/types/menu-props.type'
import type { IFieldProps } from '../../Field/types/field-props.type'
import type { IDialogProps } from '../../Dialog/types/dialog-props.type'

export type ISelectorProps = IFieldProps & {
  /**
   * Whether the Selector can be cleared -> will emit `emptyValue`
   */
  clearable?: boolean

  /**
   * When true, the `append` slot will not be shown
   */
  noAppend?: boolean

  /**
   * Whether to hide "remove" buttons for selected items (for multi selection chips)
   */
  noItemsRemove?: boolean

  /**
   * For cases when we want to warn user that he is about to clear the value
   * Usecase: when there is a dependent variable based on currently selected
   * option and by clearing the Selector, we need to also reset the dependent variable
   */
  clearConfirmation?: string

  /**
   * When true, the options will be cleared when the menu is hidden
   */
  clearOptionsOnMenuHide?: boolean

  /**
   * When true, the options will be fetched immediately on initialization, without
   * waiting for the user to open the menu
   */
  immediateFetch?: boolean

  /**
   * When true, the dropdown icon will not be shown
   */
  noDropdownIcon?: boolean

  /**
   * By default, the value (for single selection) is truncated,
   * this will prevent that
   */
  noTruncate?: boolean

  /**
   * Whether to preselect the first option
   */
  preselectFirst?: boolean

  /**
   * Initial map of options
   *
   * Usage: let's say we have selected a key `id: 1`
   * If we don' provide any options (or we have't loaded any options yet),
   * the label for this option will be just `1`
   *
   * But we might have the label for this option already (probably from BE),
   * so we can provide the initial map to show the label instead like so:
   * `{ 1: { id: 1, label: 'John Doe' } }` (assuming they `optionLabel` is `label`)
   */
  initialMap?: Record<string, any>

  /**
   * Maximum number of chips to show in the field
   */
  maxChipsRows?: number

  /**
   * The identifier key for the option
   */
  optionKey?: string

  /**
   * The label for the option
   */
  optionLabel?: ((opt: any) => string) | string

  /**
   * Options for the `List` (technically the same as `listProps.items`)
   */
  options?: any[]

  /**
   * A link to the option (for multi selection)
   */
  optionTo?: (item: any) => RouteLocationRaw

  /**
   * A link to the item (for single selection)
   */
  to?: RouteLocationRaw | ((item: any) => RouteLocationRaw)

  // List
  /**
   * List selection `emitKey` prop, exposed for convenience
   */
  emitKey?: boolean

  /**
   * List `loadData` prop, exposed for convenience
   */
  loadData?: IListProps['loadData']

  /**
   * List selection `multi` prop, exposed for convenience
   */
  multi?: boolean

  /**
   * List `noFilter` prop, exposed for convenience
   */
  noFilter?: IListProps['noFilter']

  /**
   * List sort `enabled` prop, exposed for convenience
   */
  noSort?: boolean

  /**
   * When true, the `search` will be cleared when the picker is hidden
   */
  clearSearchOnHide?: boolean

  /**
   * List search `enabled` prop, exposed for convenience
   */
  noSearch?: boolean

  /**
   * List `search` prop
   */
  search?: string

  /**
   * List `addedItems` prop
   */
  addedItems?: IListProps['addedItems']

  /**
   * When true, the menu will NOT match the width of the selector
   * Use case:
   *   - when the selector has options with long text and icons and we only want
   *     to show the icon when the options is chosen -> the Selector component
   *     can be very small (to show the icon) but the menu still should be wide
   *     enough to show the whole text
   */
  noMenuMatchWidth?: boolean

  /**
   * The props that should be passed to the input tag (<input>)
   */
  inputProps?: Record<string, any>

  /**
   * Props to be passed to the Menu
   */
  menuProps?: IDialogProps & IMenuProps & AllowedComponentProps

  /**
   * Props to be passed to the List
   */
  listProps?: Omit<IListProps, 'search' | 'adddedItems' | 'selection'>

  /**
   * When true, `HorizontalScroller` will be used as the inner container
   */
  useScroller?: boolean

  /**
   * Visual configuration
   */
  ui?: {
    /**
     * Class applied to the `append` slot
     */
    appendClass?: ClassType

    /**
     * The class applied to the `Chip` when using `multi` mode
     */
    chipClass?: ClassType | ((item: any) => ClassType)

    /**
     * The style applied to the `Chip` when using `multi` mode
     */
    chipStyle?: CSSProperties | ((item: any) => CSSProperties)

    /**
     * Class to apply to the actual content inside the wrapper
     */
    innerClass?: ClassType

    /**
     * Style to apply to the actual content inside the wrapper
     */
    innerStyle?: CSSProperties
  }
}

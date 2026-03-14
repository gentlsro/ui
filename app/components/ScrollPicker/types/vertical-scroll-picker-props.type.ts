export type IVerticalScrollPickerProps = {
  /**
   * The height of each item
   */
  itemHeight?: number

  /**
   * The maximum number of items to show
   */
  maxVisible?: number

  /**
   * The model value
   */
  modelValue?: any

  /**
   * The key to use for the item
   */
  itemKey?: string

  /**
   * The key to use for the item
   */
  itemLabel?: string

  /**
   * The options to show
   */
  items?: any[]

  /**
   * The title of the picker
   */
  title?: string
}

export type IListItem = {
  /**
   * The item reference (original object)
   */
  ref: IItem

  /**
   * The unique ID of the item
   */
  id: string

  /**
   * The label of the item
   */
  label: string

  /**
   * The highlighted label of the item
   */
  _highlighted?: string

  /**
   * The path of the item
   */
  path: string

  /**
   * The index of the item
   */
  index: number
}

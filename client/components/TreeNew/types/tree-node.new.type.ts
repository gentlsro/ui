export type ITreeNode<T extends IItem = IItem> = {
  id: string | number
  label?: string | number

  /**
   * Reference to the original item
   */
  ref: T
}

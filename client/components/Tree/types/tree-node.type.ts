export type ITreeNode<T extends IItem = IItem> = IItem<T> & {
  id: string | number
}

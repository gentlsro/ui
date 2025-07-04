export type ITreeNodeMeta<T extends IItem = IItem> = {
  level: number
  childrenLoaded: boolean
  parent?: ITreeNode<T> | null
  collapsed?: boolean
}

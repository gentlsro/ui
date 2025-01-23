export type ITreeNodeMeta = {
  level: number
  childrenLoaded: boolean
  parent?: ITreeNode | null
  collapsed?: boolean
}

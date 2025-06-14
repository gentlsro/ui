export type ITreeEmitFncs = {
  nodeClick: (payload: { node: ITreeNode, ev?: MouseEvent }) => void
  nodeFocus: (payload: { node: ITreeNode }) => void
}

export type ITreeEmitFncs<T extends IItem = IItem> = {
  nodeClick: (payload: { node: T, ev?: MouseEvent }) => void
  nodeContextMenu: (payload: { node: T, ev?: MouseEvent }) => void
  nodeFocus: (payload: { node: T }) => void
  nodeBlur: (payload: { node?: T }) => void
}

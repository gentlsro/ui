export type ITreeEmits = {
  (e: 'click:node', payload: { node: ITreeNode, ev?: MouseEvent }): void
  (e: 'focus:node', payload: { node: ITreeNode }): void
  (e: 'blur:node', payload: { node?: ITreeNode }): void
}

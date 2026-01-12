// Types
import type { ITreeNode } from './tree-node.type'

export type ITreeEmitFncs<T extends IItem = IItem> = {
  nodeClick: (payload: { node: ITreeNode<T>, ev?: MouseEvent }) => void
  nodeFocus: (payload: { node: ITreeNode<T>, focusEvent: 'focus' | 'blur' }) => void
  nodeBlur: (payload: { node?: ITreeNode<T>, focusEvent: 'focus' | 'blur' }) => void
  nodeSelect: (payload: { node: ITreeNode<T>, ev?: MouseEvent | KeyboardEvent }) => void
  nodeUnselect: (payload: { node: ITreeNode<T>, ev?: MouseEvent | KeyboardEvent }) => void
  nodeHover: (payload: { node: ITreeNode<T> }) => void
}

// Types
import type { ITreeNode } from './tree-node.new.type'

export type ITreeEmits<T extends IItem = IItem> = {
  (e: 'click:node', payload: { node: ITreeNode<T>, ev?: MouseEvent }): void
  (e: 'focus:node', payload: { node: ITreeNode<T> }): void
  (e: 'blur:node', payload: { node?: ITreeNode<T> }): void
  (e: 'select:node', payload: { node: ITreeNode<T>, ev?: MouseEvent | KeyboardEvent }): void
  (e: 'unselect:node', payload: { node: ITreeNode<T>, ev?: MouseEvent | KeyboardEvent }): void
}

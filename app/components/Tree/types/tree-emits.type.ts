// Types
import type { ITreeProps } from './tree-props.type'
import type { ITreeNode } from './tree-node.type'

export type ITreeEmits<T extends IItem = IItem> = {
  (e: 'update:search', value: ITreeProps<T>['search']): void
  (e: 'update:selection', value: ITreeProps<T>['selection']): void
  (e: 'update:meta', value: ITreeProps<T>['meta']): void
  (e: 'update:modelValue', value: ITreeProps<T>['modelValue']): void
  (e: 'click:node', payload: { node: ITreeNode<T>, ev?: MouseEvent }): void
  (e: 'focus:node', payload: { node: ITreeNode<T> }): void
  (e: 'blur:node', payload: { node?: ITreeNode<T> }): void
  (e: 'select:node', payload: { node: ITreeNode<T>, ev?: MouseEvent | KeyboardEvent }): void
  (e: 'unselect:node', payload: { node: ITreeNode<T>, ev?: MouseEvent | KeyboardEvent }): void
  (e: 'hover:node', payload: { node: ITreeNode<T> }): void
}

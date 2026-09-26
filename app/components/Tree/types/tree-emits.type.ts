// Types
import type { ITreeNode } from './tree-node.type'
import type { ITreeProps } from './tree-props.type'

export type ITreeEmits<T extends IItem = IItem> = {
  (e: 'update:modelValue', val: ITreeProps<T>['modelValue']): void
  (e: 'update:search', search: ITreeProps<T>['search']): void
  (e: 'update:selection', selection: ITreeProps<T>['selection']): void
  (e: 'click:node', payload: { node: ITreeNode<T>, ev?: MouseEvent }): void
  (e: 'focus:node', payload: { node: ITreeNode<T> }): void
  (e: 'blur:node', payload: { node?: ITreeNode<T> }): void
  (e: 'select:node', payload: { node: ITreeNode<T>, ev?: MouseEvent | KeyboardEvent }): void
  (e: 'unselect:node', payload: { node: ITreeNode<T>, ev?: MouseEvent | KeyboardEvent }): void
  (e: 'hover:node', payload: { node: ITreeNode<T> }): void
}

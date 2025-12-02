// Types
import type { ITreeProps } from './tree-props.new.type'

export type ITreeNodeProps<T extends IItem = IItem> = {
  /**
   * The node
   */
  node: ITreeNode<T>

  /**
   * The UI props
   */
  ui: ITreeProps['ui']

  /**
   * The index of the node
   */
  index: number
}

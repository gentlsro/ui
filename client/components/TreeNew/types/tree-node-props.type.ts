// Types
import type { ITreeNode } from './tree-node.new.type'
import type { ITreeProps } from './tree-props.new.type'

export type ITreeNodeProps<T extends IItem = IItem> = Pick<ITreeProps<T>, 'nodeEl' | 'ui' | 'connectors'> & {
  /**
   * The node
   */
  node: ITreeNode<T>

  /**
   * The index of the node
   */
  index: number
}

// Types
import type { ITreeNode } from './tree-node.type'
import type { ITreeProps } from './tree-props.type'

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

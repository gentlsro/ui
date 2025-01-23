// Types
import type { ITreeNode } from '$utils/shared/types/tree-node.type'

export type ITreeNodeMeta = {
  level: number
  childrenLoaded: boolean
  parent?: ITreeNode | null
  collapsed?: boolean
}

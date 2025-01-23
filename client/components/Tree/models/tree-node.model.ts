// Types
import type { ITreeNode } from '$utils/shared/types/tree-node.type'

export class TreeNodeModel {
  id: ITreeNode['id']
  level: number
  childrenLoaded?: boolean | undefined

  ref: ITreeNode
  nodeById?: Record<ITreeNode['id'], ITreeNode>

  get parent() {
    return this.ref.parent ?? this.nodeById?.[this.ref.parentId ?? ''] ?? null
  }

  constructor(obj: ITreeNode, nodeById?: Record<ITreeNode['id'], ITreeNode>) {
    this.id = obj.id
    this.level = obj.level
    this.ref = obj
    this.nodeById = nodeById
  }
}

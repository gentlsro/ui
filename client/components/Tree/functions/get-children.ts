// Types
import type { ITreeNode } from '$utils/shared/types/tree-node.type'

export function getChildren(nodes: ITreeNode[]): ITreeNode[] {
  const children: ITreeNode[] = []

  nodes.forEach(node => {
    node.children?.forEach(child => {
      children.push(child)

      if (child.children) {
        children.push(...getChildren([child]))
      }
    })
  })

  return children
}

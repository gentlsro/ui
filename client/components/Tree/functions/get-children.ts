export function getChildren(
  nodes: ITreeNode[],
  options?: {
    childrenKey?: string
  },
): ITreeNode[] {
  const { childrenKey = 'children' } = options ?? {}

  const children: ITreeNode[] = []

  nodes.forEach(node => {
    const nodeChildren = get(node, childrenKey)

    nodeChildren?.forEach((child: ITreeNode) => {
      children.push(child)

      if (child[childrenKey]) {
        children.push(...getChildren([child], { childrenKey }))
      }
    })
  })

  return children
}

export function getChildren<T extends IItem = IItem>(
  nodes: ITreeNode<T>[],
  options?: {
    childrenKey?: string
  },
): ITreeNode<T>[] {
  const { childrenKey = 'children' } = options ?? {}

  const children: ITreeNode<T>[] = []

  nodes.forEach(node => {
    const nodeChildren = get(node, childrenKey)

    nodeChildren?.forEach((child: ITreeNode<T>) => {
      children.push(child)

      if (child[childrenKey]) {
        children.push(...getChildren([child], { childrenKey }))
      }
    })
  })

  return children
}

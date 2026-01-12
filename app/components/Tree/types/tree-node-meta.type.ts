export type ITreeNodeMeta = {
  /**
   * The level of the node
   *
   * Root level is 0
   */
  level: number

  /**
   * The path of the node
   *
   * For example: `0.children.1.children.2`
   *
   * where the numbers represent the node ID
   */
  path: string

  /**
   * Whether the node has children loaded
   */
  isChildrenLoaded: boolean

  /**
   * Whether the node is collapsed
   */
  isCollapsed?: boolean

  /**
   * Whether the node is loading
   */
  isLoading?: boolean
}

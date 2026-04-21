export type IElementMovementProps = {
  /**
   * Dimensions of the thing we're resizing
   */
  dimensions?: {
    /**
     * X position
     */
    x?: number | null

    /**
     * Y position
     */
    y?: number | null

    /**
     * Width
     */
    w?: number | null

    /**
     * Height
     */
    h?: number | null
  }

  /**
   * Limits for the movement and resizing
   */
  limits?: {
    /**
     * Minimum width
     */
    minW?: number

    /**
     * Minimum height
     */
    minH?: number

    /**
     * Maximum width
     */
    maxW?: number

    /**
     * Maximum height
     */
    maxH?: number

  }

  /**
   * The reference element will be used for the movement trigger
   */
  referenceEl?: any
}

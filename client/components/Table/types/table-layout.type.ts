export type ITableLayout = {
  /**
   * The layout ID
   */
  id: string | number

  /**
   * The layout label
   */
  name: string

  /**
   * The layout schema
   */
  schema: string

  /**
   * Whether the layout is public
   */
  isPublic?: boolean

  /**
   * Whether the layout is the default layout
   */
  isDefault?: boolean

  /**
   * Any other data that might be needed
   */
  [key: string]: any
}

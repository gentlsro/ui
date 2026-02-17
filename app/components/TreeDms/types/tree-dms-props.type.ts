// Types
import type { ITreeProps } from '../../Tree/types/tree-props.type'

export type ITreeDmsProps<T extends IItem = IItem> = {
  /**
   * The items
   */
  modelValue?: T[]

  /**
   * The label to display in the header
   */
  label?: string | (() => string)

  /**
   * The key to use for the file items
   */
  fileKey?: string

  /**
   * The key to use for the folder items
   */
  folderKey?: string

  /**
   * Props to be passed to the `Tree` component
   */
  treeProps?: ITreeProps<T>

  /**
   * Configuration for the context menu
   */
  contextMenuConfig?: {
    /**
     * Whether the context menu is enabled
     */
    enabled?: boolean

    /**
     * A function to extend the options of the context menu for given item
     */
    extendOptions?: (payload: {
      item?: T
    }) => Array<IBtnProps & { id: string }>
  }

  /**
   * Modifiers are a set of functions that define how the component behaves
   */
  modifiers?: {
    /**
     * A function that gets called after a item is created
     *
     * Return the (adjusted) item or throw an error to prevent the create
     *
     */
    onItemCreate?: (payload: {
      item: T
      parent?: T | null
    }) => T | Promise<T>

    /**
     * A function that gets called after a item is renamed
     *
     * Return the (adjusted) item or throw an error to prevent the rename
     *
     */
    onItemRename?: (payload: {
      item: T
      parent?: T | null
    }) => T | Promise<T>

    /**
     * A function that gets called after a item is deleted
     *
     * Return the (adjusted) item or throw an error to prevent the delete
     *
     */
    onItemDelete?: (payload: {
      item: T
      parent?: T | null
    }) => void | Promise<void>

    /**
     * A function that gets called after a item is moved
     *
     * Return the (adjusted) item or throw an error to prevent the move
     *
     */
    onItemMove?: (payload: {
      item: T
      parent?: T | null
    }) => T | Promise<T>
  }

  /**
   * Drop configuration
   */
  dropZoneConfig?: {
    /**
     * Whether the drop is allowed / enabled
     */
    enabled?: boolean

    /**
     * The key to use for the file items
     */
    fnc?: (payload: {
      item: ProcessedItem
      file?: File
      parent?: T | null
      fileKey?: string
      folderKey?: string
    }) => T | Promise<T>
  }
}

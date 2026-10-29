// Types
import type { CSSProperties } from 'vue'
import type { ITreeProps } from '../../Tree/types/tree-props.type'

// Constants
import type { TREE_DMS_DEFAULT_PROPS } from '../constants/tree-dms-default-props.constant'

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

    /**
     * A function to adjust the final options of the context menu for given item
     * (the built-in ones are `new-file`, `new-folder`, `rename` and `delete`)
     */
    getOptions?: (payload: {
      item?: T
      options: Array<IBtnProps & { id: string }>
    }) => Array<IBtnProps & { id: string }>

    /**
     * A function to provide initial values (e.g. a prefilled label) for an item
     * created from the context menu
     */
    newItem?: (payload: {
      type: string
      parent?: T
    }) => Partial<T>
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
   * Whether to hide the icons for the nodes
   */
  noNodeIcon?: boolean | { file?: boolean, folder?: boolean }

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

  /**
   * Visual configuration
   */
  ui?: {
    /**
     * Class to apply to the label
     */
    labelClass?: (payload: {
      defaults: ReturnType<typeof TREE_DMS_DEFAULT_PROPS['ui']['labelClass']>
    }) => ClassType

    /**
     * Style to apply to the label
     */
    labelStyle?: () => CSSProperties
  }
}

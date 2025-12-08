// Types
import type { ITreeProps } from '#layers/ui/client/components/TreeNew/types/tree-props.new.type'
import type { ITreeNode } from '#layers/ui/client/components/TreeNew/types/tree-node.new.type'

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
}

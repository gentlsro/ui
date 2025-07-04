import type { ITextInputProps } from '$ui'
import type { AllowedComponentProps, CSSProperties } from 'vue'

// Types
import type { ITreeNodeMeta } from './tree-node-meta.type'
import type { FuseOptions } from '@vueuse/integrations/useFuse.mjs'

export type ITreeProps<T extends IItem = IItem> = {
  /**
   * Whether to show connectors between nodes
   *
   * @default true
   */
  connectors?: boolean

  /**
   * The key to use for the children nodes
   *
   * @default 'children'
   */
  childrenKey?: string

  /**
   * The data (nodes) of the tree
   */
  modelValue?: T[]

  /**
   * The maximum level of the tree
   */
  maxLevel?: number

  /**
   * The meta containing info if the current state of nodes
   * (e.g. if they are collapsed, or children are loaded, ...)
   */
  meta?: Record<T['id'], ITreeNodeMeta<T>>

  /**
   * The element to use for the nodes
   */
  nodeEl?: string | any

  /**
   * The search value
   */
  search?: string

  /**
   * Search configuration
   */
  searchConfig?: {
    /**
     * When false, the search will be disabled
     *
     * @default true
     */
    enabled?: boolean

    /**
     * Function that is used for the search
     */
    fnc?: (search: string | undefined, nodes: T[]) => T[] | Promise<T[]>

    /**
     * The extended search token for fuse.js library
     * https://www.fusejs.io/examples.html#extended-search
     *
     * @default "'" (contains)
     */
    fuseSearchToken?: "'" | '=' | '!' | '^' | '!^' | '$' | '!$'

    /**
     * Fuse.js options
     */
    fuseOptions?: FuseOptions<T>

    /**
     * Props to pass to the search input
     */
    props?: ITextInputProps & AllowedComponentProps
  } | undefined

  /**
   * Collapsing configuration
   */
  collapsingConfig?: {
    /**
     * By default, we assume that a node has children (~ the collapse button is shown)
     * until proven otherwise (~ by clicking the collapse button).
     *
     * This function can be used to override this behavior.
     */
    hasChildrenFnc?: (node: T) => boolean

    /**
     * When true, the tree nodes will be shown even if their parents are collapsed
     * when searching
     *
     * @default true
     */
    showCollapsedWhenSearched?: boolean

    /**
     * Whether the collapse button takes space in case there are no children
     */
    collapseBtnTakesSpace?: boolean
  }

  /**
   * A definition of how to load children nodes
   */
  loadChildren?: {
    /**
     * Function to be used for loading the children nodes
     */
    fnc: (node: T) => Promise<T[]> | T[]

    /**
     * Key to get the payload from the `fnc` response
     */
    payloadKey?: string
  }

  /**
   * The selected nodes
   */
  selection?: T | ITreeNode<T>['id'] | Array<T> | Array<ITreeNode<T>['id']>

  /**
   * The selection configuration
   */
  selectionConfig?: {
    /**
     * If true, when item is selected, only the 'id' will be emitted, not
     * the whole item
     */
    emitKey?: boolean

    /**
     * Whether the selection is enabled
     */
    enabled?: boolean

    /**
     * The value to use when the selection is empty
     */
    emptyValue?: any

    /**
     * Whether the selection is multi-select
     */
    multi?: boolean
  }

  /**
   * Visual configuration
   */
  ui?: {
    /**
     * Class to apply to the content
     */
    contentClass?: ClassType

    /**
     * Style to apply to the content
     */
    contentStyle?: CSSProperties

    /**
     * Class to apply to the nodes
     */
    nodeClass?: ((payload: { node: T, isSelected: boolean }) => ClassType)

    /**
     * Style to apply to the nodes
     */
    nodeStyle?: ((payload: { node: T, isSelected: boolean }) => CSSProperties)

    /**
     * Margin (left) for the tree nodes. Uses regular CSS `margin-left` syntax
     */
    nodePadding?: string
  }
}

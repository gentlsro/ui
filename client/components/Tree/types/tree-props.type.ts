import type { CSSProperties, DefineComponent } from 'vue'

// Types
import type { ITreeNodeMeta } from './tree-node-meta.type'

export type ITreeProps = {
  /**
   * Whether to show connectors between nodes
   *
   * @default true
   */
  connectors?: boolean

  /**
   * The data (nodes) of the tree
   */
  modelValue?: ITreeNode[]

  /**
   * The maximum level of the tree
   */
  maxLevel?: number

  /**
   * The meta containing info if the current state of nodes
   * (e.g. if they are collapsed, or children are loaded, ...)
   */
  meta?: Record<ITreeNode['id'], ITreeNodeMeta>

  /**
   * The element to use for the nodes
   */
  nodeEl?: string | DefineComponent

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
    fnc?: (search: string | undefined, nodes: ITreeNode[]) => ITreeNode[] | Promise<ITreeNode[]>
  } | undefined

  /**
   * Collapsing configuration
   */
  collapsingConfig?: {
    /**
     * When true, the tree nodes will be shown even if their parents are collapsed
     * when searching
     *
     * @default true
     */
    showCollapsedWhenSearched?: boolean
  }

  /**
   * A definition of how to load children nodes
   */
  loadChildren?: {
    /**
     * Function to be used for loading the children nodes
     */
    fnc: (node: ITreeNode) => any

    /**
     * Key to get the payload from the `fnc` response
     */
    payloadKey?: string
  }

  /**
   * The selected nodes
   */
  selection?: ITreeNode | ITreeNode['id'] | Array<Pick<ITreeNode, 'id'> | ITreeNode['id']>

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
    nodeClass?: ClassType

    /**
     * Style to apply to the nodes
     */
    nodeStyle?: CSSProperties

    /**
     * Margin (left) for the tree nodes. Uses regular CSS `margin-left` syntax
     */
    nodePadding?: string
  }
}

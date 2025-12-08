import type { SortItem } from '$utils'
import type { AllowedComponentProps, CSSProperties } from 'vue'
import type { FuseOptions } from '@vueuse/integrations/useFuse.mjs'

// Types
import type { ITreeNode } from './tree-node.new.type'
import type { ITreeNodeMeta } from './tree-node-meta.new.type'
import type { IBtnProps } from '../../Button/types/btn-props.type'
import type { ITreeDragMeta } from '../../Tree/types/tree-drag-meta.type'
import type { ICheckboxProps } from '../../Checkbox/types/checkbox-props.type'
import type { ITextInputProps } from '../../Inputs/TextInput/types/text-input-props.type'
import type { IVirtualScrollerVerticalProps } from '../../VirtualScroller/types/virtual-scroller-vertical-props.type'

export type ITreeProps<T extends IItem = IItem> = {
  /**
   * Whether to show connectors between nodes
   *
   * @default true
   */
  connectors?: boolean

  /**
   * The key to use for the id of the node
   *
   * @default 'id'
   */
  idKey?: string

  /**
   * The key to use for the children nodes
   *
   * @default 'children'
   */
  childrenKey?: string

  /**
   * The key to use for the parent node
   *
   * @default 'parentId'
   */
  parentKey?: string

  /**
   * The key to use for the label of the node
   *
   * @default 'label'
   */
  labelKey?: string

  /**
   * Whether to show the loading component
   */
  loading?: boolean

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
  meta?: Record<string | number, Partial<ITreeNodeMeta>>

  /**
   * The element to use for the nodes
   */
  nodeEl?: string | any

  /**
   * When true, the keyboard navigation will be disabled
   */
  noKeyboard?: boolean

  /**
   * Scroller configuration
   */
  scrollerConfig?: Partial<IVirtualScrollerVerticalProps<T>>

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
    fnc?: (
      search: string | undefined,
      nodes: ITreeNode<T>[],
    ) => ITreeNode<T>[] | Promise<ITreeNode<T>[]>

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
   * Actions configuration
   */
  actionsConfig?: {
    /**
     * Whether the actions are enabled
     */
    enabled?: boolean

    /**
     * The props to pass to the collapse all / expand all buttons
     */
    btnProps?: IBtnProps & AllowedComponentProps

    /**
     * Whether to automatically load children nodes when expanding all nodes
     */
    autoLoadChildrenOnExpandAll?: boolean
  } | undefined

  /**
   * Collapsing configuration
   */
  collapseConfig?: {
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
    btnTakesSpace?: boolean

    /**
     * The props to pass to the collapse button
     */
    btnProps?: IBtnProps & AllowedComponentProps

    /**
     * Expanded level on init
     *
     * For example, if set to 1, the first level of nodes will be expanded on init
     *
     * @default 0 (no levels expanded on init)
     */
    expandedLevelOnInit?: number
  }

  dndConfig?: {
    /**
     * Whether the drag and drop is enabled
     */
    enabled?: boolean

    /**
     * The mode used for dropping the node
     *
     * @default 'parent'
     *
     * - `parent`: The node will be dropped as a child of the parent node
     * - `place`: The node will be dropped at specific place (e.g. above or below a node)
     */
    dropMode?: 'parent' | 'place'

    /**
     * Function that is used to check if the draged node can be dropped at given node
     */
    canBeDropped?: (payload: {
      draggedNode: ITreeNode<T>
      targetNode?: ITreeNode<T>
      nodeById: Record<string, ITreeNode<T>>
      nodeMetaById: Record<string, ITreeNodeMeta>
    }) => boolean

    /**
     * Function used to get the parent node when dropping over some node
     * Return `null` or `undefined` if no parent node is found
     *
     * This is useful when we have a structure of different "types" of nodes,
     * let's say "ITEM" and "GROUP"
     *
     * Obviously, we cannot drop "ITEM" on an "ITEM", so use this fnc to return the
     * parent "GROUP" node (if there is any)
     *
     * NOTE: This is relevant only for `dropMode = parent`
     */
    getParentNode?: (payload: {
      childrenKey: string
      dragMeta: ITreeDragMeta<T>
      draggedNode: ITreeNode<T>
      targetNode?: ITreeNode<T>
      nodeById: Record<string, ITreeNode<T>>
      nodeMetaById: Record<string, ITreeNodeMeta>
    }) => ITreeNode<T> | undefined | null

    /**
     * Function that is called before a node is moved
     * Must return the (adjusted) node or throw an error to prevent the move
     *
     * Use-case: Call API
     */
    onBeforeMove?: (payload: {
      node: ITreeNode<T>
      target?: ITreeNode<T> | null
      targetParent?: ITreeNode<T> | null
      nodeById: Record<string, ITreeNode<T>>
      nodeMetaById?: Record<string, ITreeNodeMeta>
    }) => T | Promise<T>

    /**
     * Function that is called when a node is moved
     */
    onMoved?: (payload: {
      node: ITreeNode<T>
      target?: ITreeNode<T> | null
      targetParent?: ITreeNode<T> | null
      nodeById: Record<string, ITreeNode<T>>
      nodeMetaById?: Record<string, ITreeNodeMeta>
    }) => void | Promise<void>
  }

  /**
   * A definition of how to load children nodes
   */
  loadChildrenConfig?: {
    /**
     * Function to be used for loading the children nodes
     */
    fnc: (node: ITreeNode<T>) => Promise<any> | any

    /**
     * Key to get the payload from the `fnc` response
     */
    payloadKey?: string
  }

  /**
   * The selected nodes
   */
  selection?: T | string | number | Array<T> | Array<string | number>

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
     * Whether the selection is multi-select
     */
    multi?: boolean

    /**
     * The props to pass to the select checkbox
     */
    checkboxProps?: ICheckboxProps & AllowedComponentProps

    /**
     * Function that is called before a node is selected
     *
     * Return `false` to prevent the selection from happening, any other value
     * will not do anything
     */
    beforeSelect?: (payload: {
      node: ITreeNode<T>
      ev?: MouseEvent | KeyboardEvent
    }) => void | boolean | undefined | Promise<void | boolean | undefined>
  }

  /**
   * Sorting configuration
   */
  sortingConfig?: {
    /**
     * When false, the sorting will be disabled
     *
     * @default true
     */
    enabled?: boolean

    /**
     * The sorting itemscons
     */
    sortBy?: SortItem[]
  }

  /**
   * Visual configuration
   */
  ui?: {
    /**
     * Class to apply to the tree (wrapper)
     */
    treeClass?: ClassType

    /**
     * Style to apply to the tree (wrapper)
     */
    treeStyle?: CSSProperties

    /**
     * Class to apply to the content
     */
    contentClass?: ClassType

    /**
     * Style to apply to the content
     */
    contentStyle?: CSSProperties

    /**
     * Class to apply to the collapse button
     */
    collapseBtnClass?: ClassType

    /**
     * Style to apply to the collapse button
     */
    collapseBtnStyle?: CSSProperties

    /**
     * Class to apply to the select checkbox
     */
    selectCheckboxClass?: ClassType

    /**
     * Style to apply to the select checkbox
     */
    selectCheckboxStyle?: CSSProperties

    /**
     * Class to apply to the nodes
     */
    nodeClass?: ((payload: {
      node: T
      isSelected: boolean
      index: number
      isFocused: boolean
      isMulti: boolean
    }) => ClassType)

    /**
     * Style to apply to the nodes
     */
    nodeStyle?: ((payload: {
      node: T
      isSelected: boolean
      index: number
      isFocused: boolean
      isMulti: boolean
    }) => CSSProperties)

    /**
     * Class to apply to the node content (excluding the collapse button)
     */
    nodeContentClass?: ((payload: {
      node: T
      isSelected: boolean
      index: number
      isFocused: boolean
      isMulti: boolean
    }) => ClassType)

    /**
     * Style to apply to the node content (excluding the collapse button)
     */
    nodeContentStyle?: ((payload: {
      node: T
      isSelected: boolean
      index: number
      isFocused: boolean
      isMulti: boolean
    }) => CSSProperties)

    /**
     * Class to apply to the no data component
     */
    noDataClass?: ClassType

    /**
     * Style to apply to the no data component
     */
    noDataStyle?: CSSProperties

    /**
     * Class to apply to the tree content
     */
    treeContentClass?: ClassType

    /**
     * Style to apply to the tree content
     */
    treeContentStyle?: CSSProperties

    /**
     * Class to apply to the tree actions (wrapper)
     */
    treeActionsClass?: ClassType

    /**
     * Style to apply to the tree actions (wrapper)
     */
    treeActionsStyle?: CSSProperties

    /**
     * Class to apply to the tree search
     */
    treeSearchClass?: ClassType

    /**
     * Class to apply to the tree search
     */
    treeSearchStyle?: CSSProperties

    /**
     * Margin (left) for the tree nodes. Uses regular CSS `margin-left` syntax
     */
    nodePadding?: string
  }
}

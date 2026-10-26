// Types
import type { AnyDraggable } from 'dragdoll'
import type { ComponentExposed } from 'vue-component-type-helpers'
import type VirtualScroller from '../../VirtualScroller/VirtualScroller.vue'
import type { ITreeNode } from '../types/tree-node.type'
import type { ITreeProps } from '../types/tree-props.type'
import type { ITreeEmitFncs } from '../types/tree-emit-fncs.type'
import type { ITreeNodeMeta } from '../types/tree-node-meta.type'
import type { ITreeDragMeta } from '../types/tree-drag-meta.type'

// Composables
import { useTreeDragAndDrop } from '../composables/useTreeDragAndDrop'

// Functions
import { moveNode } from '../functions/move-node'
import { searchNodes } from '../functions/search-nodes'
import { insertNodes } from '../functions/insert-nodes'
import { removeNodes } from '../functions/remove-nodes'
import { flattenTreeNodes } from '../functions/flatten-tree-nodes'

// Constants
import { TREE_INJECTION_KEY } from '../constants/tree-injection-key.constant'
import { toggleNodeCollapse } from '../functions/toggle-node-collapse'

function isSameNodes(a: ITreeNode[], b: ITreeNode[]) {
  const aRaw = toRaw(a)
  const bRaw = toRaw(b)

  return aRaw === bRaw || (aRaw.length === bRaw.length && aRaw.every((node, idx) => toRaw(node) === toRaw(bRaw[idx])))
}

type IConfig<T extends IItem = IItem> = {
  treeProps?: ITreeProps<T>
  injectionKey?: string
}

function createStore<T extends IItem = IItem>(injectionKey?: string) {
  const injectionState = createInjectionState((payload?: IConfig<T>) => {
    const { treeProps } = payload ?? {}
    const { searchDataSync } = useSearching()

    const idKey = computed(() => treeProps?.idKey === undefined ? 'id' : treeProps.idKey)

    const labelKey = computed(() => treeProps?.labelKey === undefined ? 'label' : treeProps.labelKey)

    const childrenKey = computed(() => treeProps?.childrenKey === undefined ? 'children' : treeProps.childrenKey)

    const parentKey = computed(() => treeProps?.parentKey === undefined ? 'parentId' : treeProps.parentKey)

    const maxLevel = computed(() => treeProps?.maxLevel)

    // Configs
    const actionsConfig = ref(treeProps?.actionsConfig) as Ref<ITreeProps<T>['actionsConfig']>
    const loadChildrenConfig = ref(treeProps?.loadChildrenConfig) as Ref<ITreeProps<T>['loadChildrenConfig']>
    const searchConfig = ref(treeProps?.searchConfig) as Ref<ITreeProps<T>['searchConfig']>
    const selectionConfig = ref(treeProps?.selectionConfig) as Ref<ITreeProps<T>['selectionConfig']>
    const dndConfig = ref(treeProps?.dndConfig) as Ref<ITreeProps<T>['dndConfig']>
    const collapseConfig = ref(treeProps?.collapseConfig) as Ref<ITreeProps<T>['collapseConfig']>
    const sortingConfig = ref(treeProps?.sortingConfig) as Ref<ITreeProps<T>['sortingConfig']>
    const ui = ref(treeProps?.ui) as Ref<ITreeProps<T>['ui']>

    // Layout
    const treeEl = ref<HTMLElement>()
    const searchEl = ref<any>()
    const scrollerEl = ref<ComponentExposed<typeof VirtualScroller<ITreeNode<T>>>>()

    // Search
    const search = initRef({
      propName: 'search',
      props: treeProps,
      defaultValue: undefined,
    }) as Ref<string | undefined>

    const isSearched = computed(() => !!search.value)

    // Selection
    const selection = initRef({
      propName: 'selection',
      props: treeProps,
    }) as Ref<ITreeProps<T>['selection']>

    // Focusing
    const nodeHovered = ref<ITreeNode<T> | undefined>()
    const nodeFocused = ref<ITreeNode<T> | undefined>()

    watch(nodeFocused, (node, oldNode) => {
      if (node) {
        emits.value.nodeFocus({ node, focusEvent: 'focus' })
      } else {
        emits.value.nodeBlur({ node: oldNode, focusEvent: 'blur' })
      }
    })

    watch(nodeHovered, node => {
      if (node) {
        emits.value.nodeHover({ node })
      }
    })

    // D'n'D
    const draggedNode = ref<ITreeNode<T> | undefined>()
    const dragMeta = ref<ITreeDragMeta<T>>({}) as Ref<ITreeDragMeta<T>>
    const cancelDrag = ref(false)
    const activeDraggable = shallowRef<AnyDraggable | null>(null)

    // Nodes
    const nodesFlattened = shallowRef<ITreeNode<T>[]>([])
    const ancestorIdsByNodeId = shallowRef<Record<ITreeNode['id'], ITreeNode['id'][]>>({})
    const parentIdByNodeId = shallowRef<Record<ITreeNode['id'], ITreeNode['id'] | undefined>>({})
    const childrenIdsByNodeId = shallowRef<Record<ITreeNode['id'], ITreeNode['id'][]>>({})

    const nodeMetaById = initRef({
      propName: 'meta',
      props: treeProps,
      defaultValue: {},
    }) as Ref<Record<ITreeNode['id'], ITreeNodeMeta>>

    const model = initRef({
      propName: 'modelValue',
      props: treeProps,
    }) as Ref<T[]>

    const nodeById = computed(() => {
      return nodesFlattened.value.reduce((agg, node) => {
        agg[node.id] = node

        return agg
      }, {} as Record<ITreeNode['id'], ITreeNode<T>>)
    })

    // Nodes search & visible
    // Search replaces this derived list; node wrappers stay immutable, while
    // their source items and collapse metadata keep their existing reactivity.
    const nodesSearched = shallowRef<ITreeNode<T>[]>([])
    const isSearchFiltered = shallowRef(false)
    const isInitializing = shallowRef(false)
    const searchError = shallowRef<unknown>()
    let mounted = false
    let disposed = false
    let searchRequest = 0
    let pendingSearchCommit: (() => void) | undefined
    let previousSortingConfig = sortingConfig.value
    let previousSearchConfig = searchConfig.value

    onMounted(() => {
      mounted = true
      pendingSearchCommit?.()
      pendingSearchCommit = undefined
    })

    onScopeDispose(() => {
      disposed = true
      searchRequest++
      pendingSearchCommit = undefined
    })

    const { trigger: flattenTrigger, ignorePrevAsyncUpdates: ignorePreviousFlatten } = watchTriggerable(
      [model, idKey, labelKey, childrenKey],
      ([nodes]) => {
        const previousNodes = nodesFlattened.value
        const previousNodeById = new Map(previousNodes.map(node => [node.id, node]))

        const nodesFlattenedNew = flattenTreeNodes<T>({
          nodes: nodes ?? [],
          nodeMetaById,
          idKey: idKey.value,
          childrenKey: childrenKey.value,
          labelKey: labelKey.value,
          collapseConfig: collapseConfig.value,
          sortingConfig: sortingConfig.value,
          previousNodeById,
        })

        // The same nodes in the same order: the hierarchy did not change, only the items may have
        if (isSameNodes(nodesFlattenedNew, previousNodes)) {
          return searchTrigger()
        }

        // Search once after the hierarchy indexes have been rebuilt.
        ignoreSearchUpdates(() => nodesFlattened.value = nodesFlattenedNew)

        const idByString = nodesFlattened.value.reduce((agg, node) => {
          agg[String(node.id)] = node.id

          return agg
        }, {} as Record<string, ITreeNode['id']>)

        const _parentIdByNodeId = nodesFlattened.value.reduce((agg, node) => {
          agg[node.id] = undefined

          return agg
        }, {} as Record<ITreeNode['id'], ITreeNode['id'] | undefined>)

        const _childrenIdsByNodeId = nodesFlattened.value.reduce((agg, node) => {
          agg[node.id] = []

          return agg
        }, {} as Record<ITreeNode['id'], ITreeNode['id'][]>)

        const metaById = toRaw(nodeMetaById.value)

        ancestorIdsByNodeId.value = nodesFlattened.value.reduce((agg, node) => {
          const { path } = metaById[node.id] ?? {}

          if (!path) {
            agg[node.id] = []

            return agg
          }

          agg[node.id] = path
            .split('.')
            .filter(part => part !== childrenKey.value)
            .slice(0, -1)
            .map(id => idByString[id] ?? id)

          const parentId = agg[node.id]?.at(-1)
          _parentIdByNodeId[node.id] = parentId

          if (!isNil(parentId) && (parentId in _childrenIdsByNodeId)) {
            _childrenIdsByNodeId[parentId]?.push(node.id)
          }

          return agg
        }, {} as Record<ITreeNode['id'], ITreeNode['id'][]>)

        parentIdByNodeId.value = _parentIdByNodeId
        childrenIdsByNodeId.value = _childrenIdsByNodeId

        return searchTrigger()
      },
    )

    const {
      trigger: searchTrigger,
      ignoreUpdates: ignoreSearchUpdates,
      ignorePrevAsyncUpdates: ignorePreviousSearch,
    } = watchTriggerable(
      [search, nodesFlattened],
      ([search, nodesFlattened]) => {
        const request = ++searchRequest
        pendingSearchCommit = undefined
        searchError.value = undefined

        let result: ITreeNode<T>[] | Promise<ITreeNode<T>[]>
        try {
          result = searchNodes<T>({
            nodesFlattened,
            search: search ?? '',
            idKey: idKey.value,
            labelKey: labelKey.value,
            nodeById: nodeById.value,
            ancestorIdsByNodeId: ancestorIdsByNodeId.value,
            parentIdByNodeId: parentIdByNodeId.value,
            childrenIdsByNodeId: childrenIdsByNodeId.value,
            searchConfig: searchConfig.value,
            searchData: searchDataSync,
          })
        } catch (error) {
          handleSearchError(error)

          return
        }

        function handleSearchError(error: unknown) {
          if (disposed || request !== searchRequest) {
            return
          }
          const commitError = () => {
            if (!disposed && request === searchRequest) {
              searchError.value = error
              isInitializing.value = false
            }
          }
          if (mounted) {
            commitError()
          } else {
            isInitializing.value = true
            pendingSearchCommit = commitError
          }
        }

        function commit(searchedNodes: ITreeNode<T>[]) {
          if (disposed || request !== searchRequest) {
            return
          }

          // Set together with the result, so the search's start does not render every node before the matches.
          // Only a query opens the rows: a custom search function narrowing the nodes without one (a filter) keeps
          // the collapsed rows collapsed
          isSearchFiltered.value = !!search

          if (searchedNodes === nodesFlattened || !isSameNodes(searchedNodes, nodesSearched.value)) {
            nodesSearched.value = searchedNodes
          }

          isInitializing.value = false
        }

        if (Array.isArray(result)) {
          commit(result)

          return
        }

        // Async custom searches render the same pending state on the server
        // and the first client pass. Commit after mount, without async setup.
        if (!mounted) {
          isInitializing.value = true
        }

        return result.then(searchedNodes => {
          if (disposed || request !== searchRequest) {
            return
          }

          if (mounted) {
            commit(searchedNodes)
          } else {
            pendingSearchCommit = () => commit(searchedNodes)
          }
        }, handleSearchError)
      },
    )

    watch(sortingConfig, config => {
      if (!isEqual(config, previousSortingConfig)) {
        previousSortingConfig = config
        flattenTrigger()
      }
    })

    watch(searchConfig, config => {
      if (!isEqual(config, previousSearchConfig)) {
        previousSearchConfig = config
        searchTrigger()
      }
    })

    /**
     * A search query is active: with `showCollapsedWhenSearched`, the matches are shown even when their parents are
     * collapsed (the collapsed state itself is kept for when the search ends)
     */
    const isSearchExpanded = computed(() => {
      return isSearchFiltered.value && collapseConfig.value?.showCollapsedWhenSearched !== false
    })

    /**
     * The rows collapsed while `isSearchExpanded`: collapsing during a search hides the row's matches without
     * touching `meta.isCollapsed`, and a new query (or the search's end) starts with every row open again
     */
    const searchCollapsedIds = shallowRef(new Set<ITreeNode['id']>())

    watch([search, isSearchExpanded], () => {
      if (searchCollapsedIds.value.size) {
        searchCollapsedIds.value = new Set()
      }
    })

    /**
     * Whether the node's row is collapsed as shown: `meta.isCollapsed`, or the search's own state while
     * `isSearchExpanded`
     */
    function isNodeCollapsed(nodeId: ITreeNode['id']) {
      return isSearchExpanded.value
        ? searchCollapsedIds.value.has(nodeId)
        : !!nodeMetaById.value[nodeId]?.isCollapsed
    }

    function toggleSearchCollapsed(nodeId: ITreeNode['id']) {
      const ids = new Set(searchCollapsedIds.value)

      if (!ids.delete(nodeId)) {
        ids.add(nodeId)
      }

      searchCollapsedIds.value = ids
    }

    // Derive visibility lazily: async initialization must also update it during SSR,
    // where queued watchers do not run. Reuse equal results to avoid row churn.
    const nodesVisible = computed<ITreeNode<T>[]>(previousNodes => {
      const nodes = nodesSearched.value
      const usesFlatSearchView = isSearched.value && !searchConfig.value?.keepParents

      if (usesFlatSearchView) {
        return nodes
      }

      const ancestorIds = ancestorIdsByNodeId.value

      // Only the rows collapsed during the search hide their matches
      let visibleNodes: ITreeNode<T>[]
      if (isSearchExpanded.value) {
        const collapsedIds = searchCollapsedIds.value

        visibleNodes = collapsedIds.size
          ? nodes.filter(node => !ancestorIds[node.id]?.some(ancestorId => collapsedIds.has(ancestorId)))
          : nodes
      } else {
        // Only get non-collapsed nodes
        const metaById = nodeMetaById.value

        visibleNodes = nodes.filter(node => {
          return !ancestorIds[node.id]?.some(ancestorId => metaById[ancestorId]?.isCollapsed)
        })
      }

      return previousNodes && isSameNodes(visibleNodes, previousNodes)
        ? previousNodes
        : visibleNodes
    })

    // Sync the flattened nodes back to the source nodes
    // (we must keep the hierarchy)

    // Emits
    const emits = ref<ITreeEmitFncs<T>>({
      nodeClick: () => {},
      nodeFocus: () => {},
      nodeBlur: () => {},
      nodeSelect: () => {},
      nodeUnselect: () => {},
      nodeHover: () => {},
    })

    // Built-in sorting/search and synchronous custom searches commit before
    // rendering. Only a genuinely asynchronous custom search stays pending.
    function init() {
      // Merged configuration is applied by the owner after creating the store.
      // Its queued watchers must not repeat the same initial custom search.
      ignorePreviousFlatten()
      ignorePreviousSearch()
      previousSortingConfig = sortingConfig.value
      previousSearchConfig = searchConfig.value

      return flattenTrigger()
    }

    // Helper functions
    function collapseNode(node: ITreeNode<T>) {
      if (isNodeCollapsed(node.id)) {
        return
      }

      toggleNodeCollapse({ node, getStore: () => returnedData })
    }

    function expandNode(node: ITreeNode<T>) {
      if (!isNodeCollapsed(node.id)) {
        return
      }

      toggleNodeCollapse({ node, getStore: () => returnedData })
    }

    async function insertNode(
      node: T,
      options?: {
        parent?: ITreeNode<T>
        commit?: boolean
        nodes?: ITreeNode<T>[]
      },
    ) {
      const index = parent
        ? nodesFlattened.value.findIndex(n => n.id === options?.parent?.id)
        : nodesFlattened.value.length + 1

      const { added } = await insertNodes<T>({
        items: [node],
        nodesFlattened: options?.nodes ? ref(options.nodes) as Ref<ITreeNode<T>[]> : nodesFlattened,
        childrenKey: childrenKey.value,
        model,
        nodeMetaById,
        idKey: idKey.value,
        commit: options?.commit ?? true,
        index,
        parent: options?.parent,
      })

      return added[0]!
    }

    function removeNode(node: ITreeNode<T>, options?: { commit?: boolean }) {
      return removeNodes<T>({
        nodesToRemove: [node],
        nodesFlattened,
        childrenKey: childrenKey.value,
        model,
        nodeMetaById: nodeMetaById.value,
        commit: options?.commit ?? true,
      })
    }

    const { createDraggable } = useTreeDragAndDrop<T>({
      treeEl,
      scrollerEl,
      draggedNode,
      dragMeta,
      cancelDrag,
      activeDraggable,
      nodeById,
      nodeMetaById,
      dndConfig,
      childrenKey,
      expandNode,
      isNodeCollapsed,
      onMove: (node, meta) => {
        moveNode({
          mode: dndConfig.value?.dropMode ?? 'parent',
          nodeToMove: node,
          dragMeta: meta,
          getStore: () => returnedData,
        })
      },
    })

    const returnedData = {
      // Utils
      idKey,
      childrenKey,
      labelKey,
      parentKey,
      maxLevel,
      init,
      isInitializing,
      searchError,

      // Configs
      dndConfig,
      searchConfig,
      selectionConfig,
      collapseConfig,
      loadChildrenConfig,
      actionsConfig,
      sortingConfig,
      ui,

      // Layout
      treeEl,
      searchEl,
      scrollerEl,

      // Search
      search,
      isSearched,
      isSearchExpanded,
      searchTrigger,
      searchCollapsedIds,
      toggleSearchCollapsed,

      // Selection
      selection,

      // Focusing
      nodeFocused,
      nodeHovered,

      // D'n'D
      createDraggable,
      draggedNode,
      dragMeta,
      cancelDrag,
      activeDraggable,

      // Nodes
      nodeById,
      model,
      nodesVisible,
      nodeMetaById,
      nodesFlattened,

      // Helper functions
      insertNode,
      removeNode,
      collapseNode,
      expandNode,
      isNodeCollapsed,

      // Emits
      emits,
    }

    return returnedData
  }, { injectionKey })

  return injectionState
}

export function useTreeStore<T extends IItem = IItem>(payload?: IConfig<T>) {
  const injectionKey = payload?.injectionKey ?? injectLocal(TREE_INJECTION_KEY)
  const [useProvideTreeStore, useConsumeTreeStore] = createStore<T>(injectionKey)!

  return useConsumeTreeStore() ?? useProvideTreeStore(payload)
}

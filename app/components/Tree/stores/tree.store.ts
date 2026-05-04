// Types
import type { ITreeNode } from '../types/tree-node.type'
import type { ITreeProps } from '../types/tree-props.type'
import type { ITreeEmitFncs } from '../types/tree-emit-fncs.type'
import type { ITreeNodeMeta } from '../types/tree-node-meta.type'
import type { ITreeDragMeta } from '../types/tree-drag-meta.type'

// Functions
import { searchNodes } from '../functions/search-nodes'
import { insertNodes } from '../functions/insert-nodes'
import { removeNodes } from '../functions/remove-nodes'
import { flattenTreeNodes } from '../functions/flatten-tree-nodes'

// Constants
import { TREE_INJECTION_KEY } from '../constants/tree-injection-key.constant'
import { toggleNodeCollapse } from '../functions/toggle-node-collapse'

type IConfig<T extends IItem = IItem> = {
  treeProps?: ITreeProps<T>
  injectionKey?: string
}

function createStore<T extends IItem = IItem>(injectionKey?: string) {
  const injectionState = createInjectionState((payload?: IConfig<T>) => {
    const { treeProps } = payload ?? {}

    // Utils
    const instance = getCurrentInstance()

    const idKey = initRef({
      propName: 'idKey',
      instance,
      props: treeProps,
      defaultValue: 'id',
    }) as Ref<string>

    const labelKey = initRef({
      propName: 'labelKey',
      instance,
      props: treeProps,
      defaultValue: 'label',
    }) as Ref<string>

    const childrenKey = initRef({
      propName: 'childrenKey',
      instance,
      props: treeProps,
      defaultValue: 'children',
    }) as Ref<string>

    const parentKey = initRef({
      propName: 'parentKey',
      instance,
      props: treeProps,
      defaultValue: 'parentId',
    }) as Ref<string>

    const maxLevel = initRef({
      propName: 'maxLevel',
      instance,
      props: treeProps,
      defaultValue: undefined,
    }) as Ref<number | undefined>

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
    const scrollerEl = ref<any>()

    // Search
    const search = initRef({
      propName: 'search',
      instance,
      props: treeProps,
      defaultValue: undefined,
    }) as Ref<string | undefined>

    const isSearched = computed(() => !!search.value)

    // Selection
    const selection = initRef({
      propName: 'selection',
      instance,
      props: treeProps,
      defaultValue: treeProps?.selection,
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
    const dragMeta = ref<ITreeDragMeta<T>>({})
    const cancelDrag = ref(false)
    const activeDraggable = shallowRef<any>(null)

    // Nodes
    const nodesFlattened = shallowRef<ITreeNode<T>[]>([])
    const ancestorIdsByNodeId = shallowRef<Record<ITreeNode['id'], ITreeNode['id'][]>>({})
    const parentIdByNodeId = shallowRef<Record<ITreeNode['id'], ITreeNode['id'] | undefined>>({})
    const childrenIdsByNodeId = shallowRef<Record<ITreeNode['id'], ITreeNode['id'][]>>({})

    const nodeMetaById = initRef({
      propName: 'meta',
      instance,
      props: treeProps,
      defaultValue: {},
    }) as Ref<Record<ITreeNode['id'], ITreeNodeMeta>>

    const model = initRef({
      propName: 'modelValue',
      instance,
      props: treeProps,
      defaultValue: treeProps?.modelValue,
    }) as Ref<T[]>

    const nodeById = computed(() => {
      return nodesFlattened.value.reduce((agg, node) => {
        agg[node.id] = node

        return agg
      }, {} as Record<ITreeNode['id'], ITreeNode<T>>)
    })

    // Nodes search & visible
    const nodesVisible = ref<ITreeNode<T>[]>([])
    const nodesSearched = ref<ITreeNode<T>[]>([])

    const collapsedIds = computed(() => {
      return nodesSearched.value
        .filter(node => nodeMetaById.value[node.id]?.isCollapsed)
        .map(node => node.id)
        .join(',')
    })

    const { trigger: flattenTrigger } = watchTriggerable(model, async nodes => {
      nodesFlattened.value = await flattenTreeNodes<T>({
        nodes,
        nodeMetaById,
        idKey: idKey.value,
        childrenKey: childrenKey.value,
        labelKey: labelKey.value,
        collapseConfig: collapseConfig.value,
        sortingConfig: sortingConfig.value,
      })

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

      ancestorIdsByNodeId.value = nodesFlattened.value.reduce((agg, node) => {
        const { path } = nodeMetaById.value[node.id] ?? {}

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

        if (parentId && (parentId in _childrenIdsByNodeId)) {
          _childrenIdsByNodeId[parentId]?.push(node.id)
        }

        return agg
      }, {} as Record<ITreeNode['id'], ITreeNode['id'][]>)

      parentIdByNodeId.value = _parentIdByNodeId
      childrenIdsByNodeId.value = _childrenIdsByNodeId
    })

    const { trigger: searchTrigger } = watchTriggerable(
      [search, nodesFlattened],
      async ([search, nodesFlattened]) => {
        let searchedNodes: ITreeNode<T>[] = []

        if (!search && !searchConfig.value?.fnc) {
          searchedNodes = nodesFlattened
        } else {
          searchedNodes = await searchNodes<T>({
            nodesFlattened,
            search: search ?? '',
            idKey: idKey.value,
            labelKey: labelKey.value,
            nodeById: nodeById.value,
            ancestorIdsByNodeId: ancestorIdsByNodeId.value,
            parentIdByNodeId: parentIdByNodeId.value,
            childrenIdsByNodeId: childrenIdsByNodeId.value,
            searchConfig: searchConfig.value,
            collapseConfig: collapseConfig.value,
          })
        }

        nodesSearched.value = searchedNodes
      },
    )

    watch([nodesSearched, collapsedIds], ([nodes]) => {
      // Only get non-collapsed nodes
      nodesVisible.value = nodes
        .filter(node => {
          const { path } = nodeMetaById.value[node.id] ?? {}
          const usesFlatSearchView = isSearched.value && !searchConfig.value?.keepParents

          if (!path || usesFlatSearchView) {
            return true
          }

          const parentsMeta = path.split('.')
            .filter(path => path !== childrenKey.value)
            .map(id => nodeMetaById.value[id])
            .slice(0, -1)
            .filter(Boolean)

          return parentsMeta.every(parentMeta => !parentMeta?.isCollapsed)
        })
    }, { immediate: true })

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

    /**
     * We have bunch of async function here that we might want to run on component init
     * for SSR reasons
     */
    async function init() {
      await flattenTrigger()
      await searchTrigger()
    }

    // Helper functions
    function collapseNode(node: ITreeNode<T>) {
      const isCollapsed = nodeMetaById.value[node.id]?.isCollapsed

      if (isCollapsed) {
        return
      }

      toggleNodeCollapse({ node, getStore: () => returnedData })
    }

    function expandNode(node: ITreeNode<T>) {
      const isCollapsed = nodeMetaById.value[node.id]?.isCollapsed

      if (!isCollapsed) {
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

    const returnedData = {
      // Utils
      idKey,
      childrenKey,
      labelKey,
      parentKey,
      maxLevel,
      init,

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
      searchTrigger,

      // Selection
      selection,

      // Focusing
      nodeFocused,
      nodeHovered,

      // D'n'D
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

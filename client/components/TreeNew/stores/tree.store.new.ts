// Types
import type { ITreeNode } from '../types/tree-node.new.type'
import type { ITreeProps } from '../types/tree-props.new.type'
import type { ITreeEmitFncs } from '../types/tree-emit-fncs.new.type'
import type { ITreeNodeMeta } from '../types/tree-node-meta.new.type'
import type { ITreeDragMeta } from '../../Tree/types/tree-drag-meta.type'

// Functions
import { moveNode } from '../functions/move-node'
import { searchNodes } from '../functions/search-nodes'
import { insertNodes } from '../functions/insert-nodes'
import { removeNodes } from '../functions/remove-nodes'
import { flattenTreeNodes } from '../functions/flatten-tree-nodes.new'

// Constants
import { TREE_INJECTION_KEY } from '../constants/tree-injection-key.constant'
import { toggleNodeCollapse } from '../functions/toggle-node-collapse'

type IConfig = {
  treeProps?: ITreeProps
  injectionKey?: string
}

function createStore(injectionKey?: string) {
  const injectionState = createInjectionState((payload?: IConfig) => {
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
    const actionsConfig = ref(treeProps?.actionsConfig) as Ref<ITreeProps['actionsConfig']>
    const loadChildrenConfig = ref(treeProps?.loadChildrenConfig) as Ref<ITreeProps['loadChildrenConfig']>
    const searchConfig = ref(treeProps?.searchConfig) as Ref<ITreeProps['searchConfig']>
    const selectionConfig = ref(treeProps?.selectionConfig) as Ref<ITreeProps['selectionConfig']>
    const dndConfig = ref(treeProps?.dndConfig) as Ref<ITreeProps['dndConfig']>
    const collapseConfig = ref(treeProps?.collapseConfig) as Ref<ITreeProps['collapseConfig']>
    const sortingConfig = ref(treeProps?.sortingConfig) as Ref<ITreeProps['sortingConfig']>
    const ui = ref(treeProps?.ui) as Ref<ITreeProps['ui']>

    // Layout
    const treeEl = ref<HTMLElement>()
    const searchEl = ref<any>()

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
    }) as Ref<ITreeProps['selection']>

    // Focusing
    const nodeFocused = ref<ITreeNode<IItem> | undefined>()

    watch(nodeFocused, (node, oldNode) => {
      if (node) {
        emits.value.nodeFocus({ node })
      } else {
        emits.value.nodeBlur({ node: oldNode })
      }
    })

    // D'n'D
    const draggedNode = ref<ITreeNode<IItem> | undefined>()
    const dragMeta = ref<ITreeDragMeta<IItem>>({})

    // Nodes
    const nodesFlattened = shallowRef<ITreeNode<IItem>[]>([])

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
    }) as Ref<IItem[]>

    const nodeById = computed(() => {
      return nodesFlattened.value.reduce((agg, node) => {
        agg[node.id] = node

        return agg
      }, {} as Record<ITreeNode['id'], ITreeNode<IItem>>)
    })

    // Nodes search & visible
    const nodesVisible = ref<ITreeNode<IItem>[]>([])
    const nodesSearched = ref<ITreeNode<IItem>[]>([])

    const collapsedIds = computed(() => {
      return nodesSearched.value
        .filter(node => nodeMetaById.value[node.id]?.isCollapsed)
        .map(node => node.id)
        .join(',')
    })

    const { trigger: flattenTrigger } = watchTriggerable(model, async nodes => {
      nodesFlattened.value = await flattenTreeNodes({
        nodes,
        nodeMetaById,
        idKey: idKey.value,
        childrenKey: childrenKey.value,
        labelKey: labelKey.value,
        collapseConfig: collapseConfig.value,
        sortingConfig: sortingConfig.value,
      })
    })

    const { trigger: searchTrigger } = watchTriggerable(
      [search, nodesFlattened],
      async ([search, nodesFlattened]) => {
        let searchedNodes: ITreeNode<IItem>[] = []

        if (!search) {
          searchedNodes = nodesFlattened
        } else {
          searchedNodes = await searchNodes({
            nodesFlattened,
            search,
            idKey: idKey.value,
            labelKey: labelKey.value,
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

          if (!path) {
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
    const emits = ref<ITreeEmitFncs<IItem>>({
      nodeClick: () => {},
      nodeFocus: () => {},
      nodeBlur: () => {},
      nodeSelect: () => {},
      nodeUnselect: () => {},
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
    function collapseNode(node: ITreeNode<IItem>) {
      const isCollapsed = nodeMetaById.value[node.id]?.isCollapsed

      if (isCollapsed) {
        return
      }

      toggleNodeCollapse({ node, getStore: () => returnedData })
    }

    function expandNode(node: ITreeNode<IItem>) {
      const isCollapsed = nodeMetaById.value[node.id]?.isCollapsed

      if (!isCollapsed) {
        return
      }

      toggleNodeCollapse({ node, getStore: () => returnedData })
    }

    async function insertNode(
      node: IItem,
      options?: {
        parent?: ITreeNode<IItem>
        commit?: boolean
        nodes?: ITreeNode<IItem>[]
      },
    ) {
      const index = parent
        ? nodesFlattened.value.findIndex(n => n.id === options?.parent?.id)
        : nodesFlattened.value.length + 1

      const { added } = await insertNodes({
        items: [node],
        nodesFlattened: options?.nodes ? ref(options.nodes) : nodesFlattened,
        childrenKey: childrenKey.value,
        model,
        nodeMetaById,
        idKey: idKey.value,
        commit: options?.commit ?? true,
        index,
        parent: options?.parent,
      })

      return added[0] as ITreeNode<IItem>
    }

    function removeNode(node: ITreeNode<IItem>, options?: { commit?: boolean }) {
      return removeNodes({
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

      // Search
      search,
      isSearched,
      searchTrigger,

      // Selection
      selection,

      // Focusing
      nodeFocused,

      // D'n'D
      draggedNode,
      dragMeta,

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

export function useTreeStore(payload?: IConfig) {
  const injectionKey = payload?.injectionKey ?? injectLocal(TREE_INJECTION_KEY)
  const [useProvideTreeStore, useConsumeTreeStore] = createStore(injectionKey)!

  return useConsumeTreeStore() ?? useProvideTreeStore(payload)
}

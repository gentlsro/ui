import { useSearching } from '$utils'

// Types
import type { ITreeProps } from '../types/tree-props.new.type'
import type { ITreeEmitFncs } from '../types/tree-emit-fncs.type'
import type { ITreeNodeMeta } from '../types/tree-node-meta.type'
import type { ITreeDragMeta } from '../types/tree-drag-meta.type'

// Functions
import { searchNodes } from '../functions/search-nodes'
import { flattenTreeNodes } from '../functions/flatten-tree-nodes.new'

// Constants
import { TREE_INJECTION_KEY } from '../constants/tree-injection-key.constant'

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
    const loadChildrenConfig = initRef({
      propName: 'loadChildrenConfig',
      instance,
      props: treeProps,
      defaultValue: treeProps?.loadChildrenConfig,
    }) as Ref<ITreeProps['loadChildrenConfig']>

    const searchConfig = initRef({
      propName: 'searchConfig',
      instance,
      props: treeProps,
      defaultValue: treeProps?.searchConfig,
    }) as Ref<ITreeProps['searchConfig']>

    const selectionConfig = initRef({
      propName: 'selectionConfig',
      instance,
      props: treeProps,
      defaultValue: treeProps?.selectionConfig,
    }) as Ref<ITreeProps['selectionConfig']>

    const dndConfig = initRef({
      propName: 'dndConfig',
      instance,
      props: treeProps,
      defaultValue: treeProps?.dndConfig,
    }) as Ref<ITreeProps['dndConfig']>

    const collapsingConfig = initRef({
      propName: 'collapsingConfig',
      instance,
      props: treeProps,
      defaultValue: treeProps?.collapsingConfig,
    }) as Ref<ITreeProps['collapsingConfig']>

    // Layout
    const treeEl = ref<HTMLElement>()
    const searchEl = ref<any>()
    const collapseBtnProps = ref<ITreeProps['collapseBtnProps']>(treeProps?.collapseBtnProps)

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

    // Nodes
    const nodesFlattened = ref<ITreeNode<IItem>[]>([])

    const nodeMetaById = initRef({
      propName: 'meta',
      instance,
      props: treeProps,
      defaultValue: {},
    }) as Ref<Record<ITreeNode['id'], ITreeNodeMeta>>

    const nodesSource = initRef({
      propName: 'modelValue',
      instance,
      props: treeProps,
      defaultValue: treeProps?.modelValue,
    }) as Ref<ITreeNode<IItem>[]>

    const nodeById = computed(() => {
      return nodesFlattened.value.reduce((agg, node) => {
        agg[node.id] = node

        return agg
      }, {} as Record<ITreeNode['id'], ITreeNode<IItem>>)
    })

    // Nodes visible
    const nodesVisible = ref<ITreeNode<IItem>[]>([])
    const nodesSearched = ref<ITreeNode<IItem>[]>([])

    const collapsedIds = computed(() => {
      return nodesSearched.value
        .filter(node => nodeMetaById.value[node.id]?.isCollapsed)
        .map(node => node.id)
    })

    watch(nodesSource, nodes => {
      nodesFlattened.value = flattenTreeNodes({
        nodes,
        idKey: idKey.value,
        childrenKey: childrenKey.value,
        parentKey: parentKey.value,
        labelKey: labelKey.value,
        collapsingConfig: collapsingConfig.value,
        treeNodeMetaById: nodeMetaById.value,
      })
    }, { immediate: true })

    watch(
      search,
      async search => {
        let searchedNodes: ITreeNode<IItem>[] = []

        if (!search) {
          searchedNodes = nodesFlattened.value
        } else {
          searchedNodes = await searchNodes({
            nodesFlattened: nodesFlattened.value,
            search,
            idKey: idKey.value,
            labelKey: labelKey.value,
            searchConfig: searchConfig.value,
            collapsingConfig: collapsingConfig.value,
          })
        }

        nodesSearched.value = searchedNodes
      },
      { immediate: true },
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

    // Emits
    const emits = ref<ITreeEmitFncs<IItem>>({
      nodeClick: () => {},
      nodeFocus: () => {},
      nodeBlur: () => {},
      nodeContextMenu: () => {},
    })

    const returnedData = {
      // Utils
      idKey,
      childrenKey,
      parentKey,
      maxLevel,

      // Configs
      dndConfig,
      searchConfig,
      selectionConfig,
      collapsingConfig,
      loadChildrenConfig,

      // Layout
      treeEl,
      searchEl,
      collapseBtnProps,

      // Search
      search,
      isSearched,

      // Selection
      selection,

      // Nodes
      nodeById,
      nodesSource,
      nodesVisible,
      nodeMetaById,
      nodesFlattened,

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

import { useSearching } from '$utils'

// Types
import type { ITreeProps } from '../types/tree-props.type'
import type { ITreeEmitFncs } from '../types/tree-emit-fncs.type'
import type { TreeNodeModel } from '../models/tree-node.model'
import type { ITreeNodeMeta } from '../types/tree-node-meta.type'

// Functions
import { getChildren } from '../functions/get-children'
import { flattenTreeNodes } from '../functions/flatten-tree-nodes'
import { getComponentProps } from '../../../functions/get-component-props'

export const treeIdKey = Symbol('__treeId')

// Utils
const { searchData } = useSearching()

function getParents(node: ITreeNode, nodeMetaById: Record<ITreeNode['id'], ITreeNodeMeta>): ITreeNode[] {
  const parent = nodeMetaById[node.id]?.parent

  if (!parent) {
    return []
  }

  return [parent, ...getParents(parent, nodeMetaById)]
}

export function useTreeStore(config?: { treeId?: string, treeProps?: ITreeProps }) {
  const { treeId, treeProps } = config ?? {}

  const _treeId = injectLocal(treeIdKey, treeId ?? useId())
  const { handleRequest } = useRequest()

  return defineStore(`tree.${_treeId}`, () => {
    // Utils
    const emits = ref<ITreeEmitFncs>({
      nodeClick: () => {},
      nodeFocus: () => {},
    })

    // Layout
    const childrenKey = ref(treeProps?.childrenKey ?? 'children')
    const maxLevel = ref(treeProps?.maxLevel)
    const loadingByNodeId = ref<Record<ITreeNode['id'], boolean>>({})

    // Search
    const search = ref(treeProps?.search)

    const searchConfig = ref<ITreeProps['searchConfig']>(
      treeProps?.searchConfig ?? getComponentProps('tree').searchConfig(),
    )

    const isSearched = computed(() => !!search.value)

    // Nodes
    const nodesSource = ref<ITreeNode[]>(treeProps?.modelValue ?? [])
    const nodeMetaById = reactive<Record<ITreeNode['id'], ITreeNodeMeta>>(
      treeProps?.meta ?? {},
    )

    const nodes = computedWithControl(
      () => nodesSource.value,
      () => flattenTreeNodes(nodesSource.value, { childrenKey: childrenKey.value, nodeMetaById }),
    )

    const nodesVisible = computedAsync(async () => {
      // Search
      const nodesSearched = searchConfig.value?.fnc
        ? await searchConfig.value.fnc(search.value, nodes.value)
        : await searchData({
          searchRef: search.value,
          rowsRef: nodes,
          fuseOptions: {
            keys: ['name'],
            useExtendedSearch: true,
            ...searchConfig.value?.fuseOptions,
          },
          fuseSearchToken: searchConfig.value?.fuseSearchToken ?? "'",
        })

      const nodesSearchedRows = nodesSearched.map(res => {
        return searchConfig.value?.fnc
          ? res
          : res.item
      }) as ITreeNode[]

      // When `showCollapsedWhenSearched` is true, we show all nodes
      if (collapsingConfig.value?.showCollapsedWhenSearched && search.value) {
        return nodesSearchedRows as ITreeNode[]
      }

      // Otherwise, we only show nodes that are not collapsed
      return nodesSearchedRows.filter(node => {
        const parents = getParents(node as ITreeNode, nodeMetaById)

        return parents.every(parent => !nodeMetaById[parent.id]?.collapsed)
      }) as ITreeNode[]
    })

    const nodeById = computed(() => {
      return nodes.value.reduce<Record<ITreeNode['id'], ITreeNode>>((agg, node) => {
        agg[node.id] = node

        return agg
      }, {} as Record<ITreeNode['id'], ITreeNode>)
    })

    function insertNodes(_nodes: ITreeNode[], parent?: ITreeNode | null) {
      if (parent) {
        let parentChildren = get(parent, childrenKey.value)

        if (!parentChildren) {
          set(parent, childrenKey.value, [])
          parentChildren = get(parent, childrenKey.value)
        }

        parentChildren.push(..._nodes)

        // Trigger reactivity manually because we are changing nested data
        nodes.trigger()
      } else {
        nodesSource.value.push(..._nodes)
      }
    }

    function removeNodes(_nodes: TreeNodeModel[]) {
      _nodes.forEach(node => {
        const parent = nodeMetaById[node.id]?.parent

        if (!parent) {
          nodesSource.value = nodesSource.value.filter(n => n.id !== node.id)
        } else {
          const parentChildren = get(parent, childrenKey.value)
          const parentChildrenFiltered = parentChildren
            ?.filter((n: ITreeNode) => n.id !== node.id)

          set(parent, childrenKey.value, parentChildrenFiltered)
        }
      })

      // Trigger reactivity manually because we are changing nested data
      nodes.trigger()
    }

    // Data fetching
    const loadChildren = ref<ITreeProps['loadChildren']>(treeProps?.loadChildren)

    // Collapsing
    const collapsingConfig = ref<ITreeProps['collapsingConfig']>(
      treeProps?.collapsingConfig ?? getComponentProps('tree').collapsingConfig(),
    )

    async function toggleCollapse(node: ITreeNode) {
      const nodeId = node.id
      const nodeMeta = nodeMetaById[node.id]
      if (!nodeMeta || !nodeMetaById[nodeId]) {
        return
      }

      const nodeChildren = get(node, childrenKey.value)

      if (nodeMeta.childrenLoaded || !isNil(nodeChildren)) {
        noop()
      } else {
        loadingByNodeId.value[node.id] = true

        const res = await handleRequest(
          () => loadChildren.value?.fnc(node) ?? [],
          {
            onComplete: () => loadingByNodeId.value[node.id] = false,
            onError: () => loadingByNodeId.value[node.id] = false,
          },
        )

        const children = loadChildren.value?.payloadKey
          ? get(res, loadChildren.value?.payloadKey) ?? []
          : (res ?? [])

        insertNodes(children, node)
      }

      nodeMetaById[nodeId].collapsed = !nodeMetaById[nodeId].collapsed
      nodeMetaById[nodeId].childrenLoaded = true

      nodes.trigger()
    }

    // Selection
    const selection = ref<ITreeProps['selection']>(treeProps?.selection)

    const selectionConfig = ref<ITreeProps['selectionConfig']>(
      treeProps?.selectionConfig ?? getComponentProps('tree').selectionConfig(),
    )

    function isSelected(node: ITreeNode) {
      if (!selectionConfig.value?.enabled) {
        return false
      }

      const arraySelected = Array.isArray(selection.value)
        ? selection.value
        : [selection.value]

      const idsSelected = arraySelected
        .map(s => typeof s === 'object' ? s.id : s)
        .filter(Boolean) as ITreeNode['id'][]

      return idsSelected.includes(node.id)
    }

    function handleSelect(payload: { node: ITreeNode, ev?: MouseEvent }) {
      const { node, ev } = payload
      emits.value.nodeClick({ node, ev })

      if (!selectionConfig.value?.enabled) {
        return
      }

      const isEmitKey = !!selectionConfig.value?.emitKey
      const isMulti = selectionConfig.value?.multi
      const children = getChildren([node], { childrenKey: childrenKey.value })
      const _isSelected = isSelected(node)

      const model = Array.isArray(selection.value)
        ? selection.value
        : selection.value ? [selection.value] : []

      // When selected
      if (_isSelected) {
        if (isMulti) {
          const ids = [
            ...children.map(c => typeof c === 'object' ? c.id : c),
            node.id,
          ]

          selection.value = model
            .filter(s => !ids.includes(typeof s === 'object' ? s.id : s))
        } else {
          selection.value = undefined
        }
      }

      // When unselected
      else {
        if (isMulti) {
          selection.value = [
            ...model,
            isEmitKey ? node.id : node,
            ...(isEmitKey ? children.map(c => c.id) : children),
          ]
        } else {
          selection.value = isEmitKey ? node.id : node
        }
      }
    }

    // Node focusing
    const nodeFocused = ref<ITreeNode>()

    whenever(nodeFocused, node => {
      emits.value.nodeFocus({ node })
    })

    return {
      // Layout
      childrenKey,
      isSearched,
      maxLevel,
      loadingByNodeId,

      // Search
      search,
      searchConfig,

      // Emits
      emits,

      // Nodes
      nodesSource,
      nodes: nodes as ComputedRef<ITreeNode[]>,
      nodesVisible,
      nodeById,
      nodeMetaById,
      nodeFocused,

      removeNodes,
      insertNodes,

      // Data fetching
      loadChildren,

      // Collapsing
      collapsingConfig,
      toggleCollapse,

      // Selection
      selection,
      selectionConfig,
      isSelected,
      handleSelect,
    }
  })()
}

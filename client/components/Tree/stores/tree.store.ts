// FIXME: Those `nodes.trigger()` should not call the `flattenTreeNodes()`
// There should be a separate mechanism to trigger the nodes change

import { klona } from 'klona/full'
import { useSearching } from '$utils'

// Types
import type { ITreeProps } from '../types/tree-props.type'
import type { ITreeEmitFncs } from '../types/tree-emit-fncs.type'
import type { ITreeNodeMeta } from '../types/tree-node-meta.type'
import type { ITreeDragMeta } from '../types/tree-drag-meta.type'

// Functions
import { getChildren } from '../functions/get-children'
import { getComponentProps } from '../../../functions/get-component-props'
import { flattenTreeNodes, getTreeNodeMeta } from '../functions/flatten-tree-nodes'

export const treeIdKey = Symbol('__treeId')

// Utils
const { searchData } = useSearching()

function getParents(
  node: ITreeNode,
  nodeMetaById: Record<ITreeNode['id'], ITreeNodeMeta>,
): ITreeNode[] {
  const parent = nodeMetaById[node.id]?.parent

  if (!parent) {
    return []
  }

  return [parent, ...getParents(parent, nodeMetaById)]
}

export function useTreeStore<T extends IItem = IItem>(config?: {
  treeId?: string
  treeProps?: ITreeProps<T>
}) {
  const { treeId, treeProps } = config ?? {}

  const _treeId = injectLocal(treeIdKey, treeId ?? useId())
  const { handleRequest } = useRequest()

  return defineStore(`tree.${_treeId}`, () => {
    // Utils
    const emits = ref<ITreeEmitFncs<T>>({
      nodeClick: () => {},
      nodeFocus: () => {},
      nodeBlur: () => {},
      nodeContextMenu: () => {},
    })

    // Layout
    const treeEl = ref<any>()
    const childrenKey = ref(treeProps?.childrenKey ?? 'children') as Ref<string>
    const parentIdKey = ref(treeProps?.parentIdKey ?? 'parentId') as Ref<string>
    const maxLevel = ref(treeProps?.maxLevel)
    const loadingByNodeId = ref<Record<ITreeNode['id'], boolean>>({})

    // Search
    const search = ref(treeProps?.search)

    const searchConfig = ref(
      treeProps?.searchConfig ?? getComponentProps('tree').searchConfig(),
    ) as Ref<ITreeProps<T>['searchConfig']>

    const isSearched = computed(() => !!search.value)

    // Nodes
    const nodesSource = ref(treeProps?.modelValue ?? []) as Ref<ITreeNode<T>[]>
    const nodeMetaById = reactive<Record<ITreeNode['id'], ITreeNodeMeta<T>>>(
      treeProps?.meta ?? {},
    )
    const collapseBtnProps = ref(treeProps?.collapseBtnProps)

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
      }) as ITreeNode<T>[]

      // When `showCollapsedWhenSearched` is true, we show all nodes
      if (collapsingConfig.value?.showCollapsedWhenSearched && search.value) {
        return nodesSearchedRows as ITreeNode<T>[]
      }

      // Otherwise, we only show nodes that are not collapsed
      return nodesSearchedRows.filter(node => {
        const parents = getParents(node as ITreeNode, nodeMetaById)

        return parents.every(parent => !nodeMetaById[parent.id]?.collapsed)
      }) as ITreeNode<T>[]
    })

    const nodeById = computed(() => {
      return nodes.value.reduce<Record<ITreeNode['id'], ITreeNode<T>>>((agg, node) => {
        agg[node.id] = node

        return agg
      }, {} as Record<ITreeNode['id'], ITreeNode<T>>)
    })

    function insertNodes(_nodes: ITreeNode<T>[], parent?: ITreeNode<T> | null) {
      if (parent) {
        let parentChildren = get(parent, childrenKey.value)

        if (!parentChildren) {
          set(parent, childrenKey.value, [])
          parentChildren = get(parent, childrenKey.value)
        }

        parentChildren.push(..._nodes)

        _nodes.forEach(node => {
          set(node, parentIdKey.value, parent?.id)

          nodeMetaById[node.id] = getTreeNodeMeta({
            node,
            nodeMetaById,
            parent,
          })
        })

        // Trigger reactivity manually because we are changing nested data
        nodes.trigger()
      } else {
        nodesSource.value = [...nodesSource.value, ..._nodes]

        _nodes.forEach(node => {
          set(node, parentIdKey.value, null)

          nodeMetaById[node.id] = getTreeNodeMeta({
            node,
            nodeMetaById,
            parent: null,
          })
        })
      }
    }

    function removeNodes(_nodes: ITreeNode<T>[]) {
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
    const loadChildren = ref<ITreeProps<T>['loadChildren']>(treeProps?.loadChildren)

    // Collapsing
    const collapsingConfig = ref<ITreeProps<T>['collapsingConfig']>(
      treeProps?.collapsingConfig ?? getComponentProps('tree').collapsingConfig(),
    )

    async function toggleCollapse(node: ITreeNode<T>) {
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

    function collapseAll() {
      function collapseNodeRecursively(node: ITreeNode<T>) {
        const nodeMeta = nodeMetaById[node.id]

        if (nodeMeta) {
          nodeMeta.collapsed = true
        }

        // Get children using the dynamic childrenKey
        const children = get(node, childrenKey.value) as ITreeNode<T>[]

        if (children && Array.isArray(children)) {
          children.forEach(child => {
            collapseNodeRecursively(child)
          })
        }
      }

      nodesSource.value.forEach(node => {
        collapseNodeRecursively(node)
      })

      nodes.trigger()
    }

    function expandAll() {
      function expandNodeRecursively(node: ITreeNode<T>) {
        const nodeMeta = nodeMetaById[node.id]

        if (nodeMeta) {
          nodeMeta.collapsed = false
        }

        // Get children using the dynamic childrenKey
        const children = get(node, childrenKey.value) as ITreeNode<T>[]

        if (children && Array.isArray(children)) {
          children.forEach(child => {
            expandNodeRecursively(child)
          })
        }
      }

      nodesSource.value.forEach(node => {
        expandNodeRecursively(node)
      })

      nodes.trigger()
    }

    // Selection
    const selection = ref(treeProps?.selection) as Ref<ITreeProps<T>['selection']>

    const selectionConfig = ref<ITreeProps<T>['selectionConfig']>(
      treeProps?.selectionConfig ?? getComponentProps('tree').selectionConfig(),
    )

    function isSelected(node: ITreeNode<T>) {
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

    async function handleSelect(payload: { node: ITreeNode<T>, ev?: MouseEvent }) {
      const { node, ev } = payload
      emits.value.nodeClick({ node, ev })

      if (!selectionConfig.value?.enabled) {
        return
      }

      if (selectionConfig.value?.beforeSelect) {
        const shouldContinue = await selectionConfig.value?.beforeSelect({ node, ev })

        if (shouldContinue === false) {
          return
        }
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
    const nodeFocused = ref<ITreeNode<T>>()

    watch(nodeFocused, (node, oldNode) => {
      if (!node) {
        emits.value.nodeBlur({ node: oldNode })
      } else {
        emits.value.nodeFocus({ node })
      }
    })

    // D'n'D
    const dndConfig = ref<ITreeProps<T>['dndConfig']>(
      treeProps?.dndConfig ?? getComponentProps('tree').dndConfig(),
    )

    const draggedNode = ref<ITreeNode<T>>()
    const dragMeta = ref<ITreeDragMeta<T>>({})

    async function moveNode(payload: {
      node: ITreeNode<T>
      to?: ITreeNode<T> | null
    }) {
      const snapshot = klona(nodesSource.value)
      let { node, to } = payload

      if (dndConfig.value?.beforeMoved) {
        node = await dndConfig.value?.beforeMoved?.({
          node: payload.node,
          to: payload.to?.id === '__ROOT__' ? null : payload.to,
          nodeById: nodeById.value,
          nodeMetaById,
          revert,
        })
      }

      removeNodes([node])

      if (to?.id === '__ROOT__') {
        insertNodes([node])
      } else {
        insertNodes([node], to)
      }

      function revert() {
        nodesSource.value = snapshot
      }

      await dndConfig.value?.onMoved?.({
        node: payload.node,
        to: payload.to?.id === '__ROOT__' ? null : payload.to,
        nodeById: nodeById.value,
        nodeMetaById,
        revert,
      })
    }

    return {
      // Layout
      treeEl,
      childrenKey,
      parentIdKey,
      isSearched,
      maxLevel,
      loadingByNodeId,
      collapseBtnProps,

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
      moveNode,

      // Data fetching
      loadChildren,

      // Collapsing
      collapsingConfig,
      collapseAll,
      expandAll,
      toggleCollapse,

      // Selection
      selection,
      selectionConfig,
      isSelected,
      handleSelect,

      // D'n'D
      dndConfig,
      draggedNode,
      dragMeta,
    }
  })()
}

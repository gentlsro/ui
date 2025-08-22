<script setup lang="ts" generic="T extends ITreeNode">
import { getActivePinia } from 'pinia'

// Types
import type { ITreeProps } from './types/tree-props.type'
import type { ITreeEmits } from './types/tree-emits.type'
import type { ITreeNodeMeta } from './types/tree-node-meta.type'

// Functions
import { useTreeKeyboard } from './functions/useTreeKeyboard'
import { treeGetExposed } from './functions/tree-get-exposed'
import { getComponentMergedProps, getComponentProps } from '../../functions/get-component-props'

// Store
import { treeIdKey, useTreeStore } from './stores/tree.store'

const props = withDefaults(defineProps<ITreeProps<T>>(), {
  ...getComponentProps('tree'),
})

const emits = defineEmits<ITreeEmits<T>>()

// Utils
const uuid = injectLocal(treeIdKey, useId()) as string

provideLocal(treeIdKey, uuid)

// Layout
const maxLevel = toRef(props, 'maxLevel') as Ref<number | undefined>
const childrenKey = toRef(props, 'childrenKey') as Ref<string>
const parentIdKey = toRef(props, 'parentIdKey') as Ref<string>
const selection = defineModel('selection') as Ref<ITreeProps<T>['selection']>
const search = defineModel<ITreeProps<T>['search']>('search')
const meta = defineModel<Record<ITreeNode['id'], ITreeNodeMeta<T>>>('meta', { default: () => ({}) })
const nodes = defineModel<NonNullable<ITreeNode<T>[]>>({
  default: getComponentProps('tree').modelValue,
})

// Merged props
const mergedProps = computed(() => {
  return getComponentMergedProps('tree', props) as ITreeProps<T>
})

// Store
const store = useTreeStore({ treeProps: props })
const {
  treeEl,
  nodesSource,
  loadChildren,
  search: storeSearch,
  searchConfig: storeSearchConfig,
  nodesVisible,
  maxLevel: storeMaxLevel,
  nodeMetaById: storeNodeMetaById,
  collapsingConfig: storeCollapsingConfig,
  selection: storeSelection,
  selectionConfig: storeSelectionConfig,
  childrenKey: storeChildrenKey,
  parentIdKey: storeParentIdKey,
  emits: storeEmits,
  dndConfig: storeDndConfig,
  nodeById: storeNodeById,
  collapseBtnProps: storeCollapseBtnProps,
} = storeToRefs(store)

storeEmits.value = {
  nodeClick: payload => emits('click:node', payload),
  nodeFocus: payload => emits('focus:node', payload),
  nodeBlur: payload => emits('blur:node', payload),
  nodeContextMenu: payload => emits('contextmenu:node', payload),
}

// Sync with store
syncRef(nodes, nodesSource, { direction: 'both' })
syncRef(maxLevel, storeMaxLevel, { direction: 'ltr' })
syncRef(toRef(mergedProps.value, 'collapsingConfig'), storeCollapsingConfig, { direction: 'ltr' })
syncRef(toRef(mergedProps.value, 'selectionConfig'), storeSelectionConfig, { direction: 'ltr' })
syncRef(toRef(mergedProps.value, 'searchConfig'), storeSearchConfig, { direction: 'ltr' })
syncRef(toRef(mergedProps.value, 'dndConfig'), storeDndConfig, { direction: 'ltr' })
syncRef(search, storeSearch, { direction: 'both' })
syncRef(childrenKey, storeChildrenKey, { direction: 'ltr' })
syncRef(parentIdKey, storeParentIdKey, { direction: 'ltr' })
syncRef(meta, storeNodeMetaById, { direction: 'rtl' })
syncRef(toRef(mergedProps.value, 'collapseBtnProps'), storeCollapseBtnProps, { direction: 'ltr' })

// @ts-expect-error Some scuffed type
syncRef(selection, storeSelection, { direction: 'both' })

loadChildren.value = props.loadChildren

// Init keyboard navigation
useTreeKeyboard()

// Lifecycle
// Dispose of store on unmount
onUnmounted(() => {
  store.$dispose()
  const pinia = getActivePinia()
  delete pinia?.state.value[store.$id]
})

defineExpose(treeGetExposed())
</script>

<template>
  <div
    ref="treeEl"
    class="tree"
    p="1"
  >
    <!-- Search -->
    <slot
      :search
      name="search"
    >
      <TreeSearch
        v-if="mergedProps.searchConfig?.enabled"
        v-model:search="storeSearch"
        :search-config
      />
    </slot>

    <!-- Nodes -->
    <VirtualScroller
      :rows="nodesVisible"
      :row-height="32"
      class="nodes"
      :class="mergedProps.ui?.contentClass"
      :style="mergedProps.ui?.contentStyle"
    >
      <template #default="{ row }">
        <TreeNode
          :node="row"
          :ui="mergedProps.ui"
          :node-el
          :connectors
        >
          <template
            v-if="$slots.node"
            #default="{ collapse, level }"
          >
            <slot
              name="node"
              :node="row"
              :collapse
              :level
              :parent="storeNodeById[row.parentId]"
            />
          </template>

          <template #node-content="{ collapse, level }">
            <slot
              name="node-content"
              :node="row"
              :collapse
              :level
              :parent="storeNodeById[row.parentId]"
            />
          </template>
        </TreeNode>
      </template>

      <!-- Drop indicator -->
      <template
        v-if="storeDndConfig?.enabled"
        #inner
      >
        <TreeDropIndicator />
      </template>
    </VirtualScroller>
  </div>
</template>

<style lang="scss" scoped>
.tree {
  @apply flex flex-col gap-1;

  .nodes {
    @apply grow;
  }
}
</style>

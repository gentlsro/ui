<script setup lang="ts">
import { getActivePinia } from 'pinia'

// Types
import type { ITreeProps } from './types/tree-props.type'
import type { ITreeEmits } from './types/tree-emits.type'

// Functions
import { useTreeKeyboard } from './functions/useTreeKeyboard'
import { getComponentMergedProps, getComponentProps } from '../../functions/get-component-props'

// Store
import { treeIdKey, useTreeStore } from './stores/tree.store'

const props = withDefaults(defineProps<ITreeProps>(), {
  ...getComponentProps('tree'),
})

const emits = defineEmits<ITreeEmits>()

// Utils
const uuid = injectLocal(treeIdKey, useId()) as string

provideLocal(treeIdKey, uuid)

// Layout
const maxLevel = toRef(props, 'maxLevel')
const selection = defineModel<ITreeProps['selection']>('selection')
const search = defineModel<ITreeProps['search']>('search')
const meta = defineModel<ITreeProps['meta']>('meta', { default: () => ({}) })
const nodes = defineModel<NonNullable<ITreeProps['modelValue']>>({
  default: getComponentProps('tree').modelValue,
})

// Merged props
const mergedProps = computed(() => {
  return getComponentMergedProps('tree', props)
})

// Store
const store = useTreeStore({ treeProps: props })
const {
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
  emits: storeEmits,
} = storeToRefs(store)

storeEmits.value = {
  nodeClick: payload => emits('click:node', payload),
  nodeFocus: payload => emits('focus:node', payload),
  nodeBlur: payload => emits('blur:node', payload),
}

// Sync with store
syncRef(nodes, nodesSource, { direction: 'both' })
syncRef(maxLevel, storeMaxLevel, { direction: 'ltr' })
syncRef(toRef(mergedProps.value, 'collapsingConfig'), storeCollapsingConfig, { direction: 'ltr' })
syncRef(toRef(mergedProps.value, 'selectionConfig'), storeSelectionConfig, { direction: 'ltr' })
syncRef(selection, storeSelection, { direction: 'both' })
syncRef(toRef(mergedProps.value, 'searchConfig'), storeSearchConfig, { direction: 'ltr' })
syncRef(search, storeSearch, { direction: 'both' })
syncRef(toRef(props, 'childrenKey', 'children'), storeChildrenKey, { direction: 'ltr' })
syncRef(meta, storeNodeMetaById, { direction: 'rtl' })

loadChildren.value = props.loadChildren

// Init keyboard navigation
const { treeEl } = useTreeKeyboard()

// Lifecycle
// Dispose of store on unmount
onUnmounted(() => {
  store.$dispose()
  const pinia = getActivePinia()
  delete pinia?.state.value[store.$id]
})
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
            />
          </template>

          <template #node-content="{ collapse, level }">
            <slot
              name="node-content"
              :node="row"
              :collapse
              :level
            />
          </template>
        </TreeNode>
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

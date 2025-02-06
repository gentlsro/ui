<script setup lang="ts">
// Types
import type { ITreeProps } from './types/tree-props.type'

// Functions
import { useTreeKeyboard } from './functions/useTreeKeyboard'
import { getComponentMergedProps, getComponentProps } from '../../functions/get-component-props'

// Store
import { treeIdKey, useTreeStore } from './stores/tree.store'

const props = withDefaults(defineProps<ITreeProps>(), {
  ...getComponentProps('tree'),
})

defineSlots<{
  search?: (props: { search?: string }) => any
  node: (props: { node: ITreeNode, collapse: () => void, level?: number }) => any
}>()

// Utils
const uuid = injectLocal(treeIdKey, useId()) as string

provideLocal(treeIdKey, uuid)

// Layout
const maxLevel = toRef(props, 'maxLevel')
const selection = defineModel<ITreeProps['selection']>('selection')
const search = defineModel<ITreeProps['search']>('search')
const nodes = defineModel<NonNullable<ITreeProps['modelValue']>>({
  default: getComponentProps('tree').modelValue,
})

// Merged props
const mergedProps = computed(() => {
  return getComponentMergedProps('tree', props)
})

// Store
const {
  nodesSource,
  loadChildren,
  search: storeSearch,
  searchConfig: storeSearchConfig,
  nodesVisible,
  maxLevel: storeMaxLevel,
  collapsingConfig: storeCollapsingConfig,
  selection: storeSelection,
  selectionConfig: storeSelectionConfig,
} = storeToRefs(useTreeStore({ treeProps: props }))

// Sync with store
syncRef(nodes, nodesSource, { direction: 'both' })
syncRef(maxLevel, storeMaxLevel, { direction: 'ltr' })
syncRef(toRef(mergedProps.value, 'collapsingConfig'), storeCollapsingConfig, { direction: 'ltr' })
syncRef(toRef(mergedProps.value, 'selectionConfig'), storeSelectionConfig, { direction: 'ltr' })
syncRef(selection, storeSelection, { direction: 'both' })
syncRef(toRef(mergedProps.value, 'searchConfig'), storeSearchConfig, { direction: 'ltr' })
syncRef(search, storeSearch, { direction: 'both' })

loadChildren.value = props.loadChildren

// Init keyboard navigation
const { treeEl } = useTreeKeyboard()
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
      <TreeSearch v-if="mergedProps.searchConfig?.enabled" />
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

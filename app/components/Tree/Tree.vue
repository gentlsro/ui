<script setup lang="ts" generic="T extends IItem = IItem">
// Types
import type { ITreeNode } from './types/tree-node.type'
import type { ITreeEmits } from './types/tree-emits.type'
import type { ITreeProps } from './types/tree-props.type'

// Composables
import { useTreeKeyboard } from './composables/useTreeKeyboard'

// Functions
import { treeGetExposed } from './functions/tree-get-exposed'

// Store
import { useTreeStore } from './stores/tree.store'

// Constants
import { TREE_INJECTION_KEY } from './constants/tree-injection-key.constant'
import { TREE_DEFAULT_PROPS } from './constants/tree-default-props.constant'

const props = withDefaults(
  defineProps<ITreeProps<T>>(),
  { ...getComponentProps('tree') },
)

const emits = defineEmits<ITreeEmits<T>>()

// Init
provideLocal(TREE_INJECTION_KEY, generateUUID())

// Utils
const mergedProps = computed(() => {
  return getComponentMergedProps('tree', props) as ITreeProps<T>
})

// Store
const {
  init,
  nodeFocused: storeNodeFocused,
  nodeHovered: storeNodeHovered,
  emits: storeEmits,
  treeEl,
  scrollerEl,
  search,
  nodesVisible,
  dndConfig,
  loadChildrenConfig,
  collapseConfig,
  selectionConfig,
  searchConfig,
  actionsConfig,
  sortingConfig,
  ui,
} = useTreeStore({ treeProps: props })

const nodeFocused = defineModel<ITreeNode<T> | undefined>('nodeFocused')
const nodeHovered = defineModel<ITreeNode<T> | undefined>('nodeHovered')

// Syncing merged props with store
syncRef(nodeFocused, storeNodeFocused, { direction: 'both' })
syncRef(nodeHovered, storeNodeHovered, { direction: 'both' })
syncRef(toRef(mergedProps.value, 'ui'), ui, { direction: 'ltr' })
syncRef(toRef(mergedProps.value, 'searchConfig'), searchConfig, { direction: 'ltr' })
syncRef(toRef(mergedProps.value, 'actionsConfig'), actionsConfig, { direction: 'ltr' })
syncRef(toRef(mergedProps.value, 'dndConfig'), dndConfig, { direction: 'ltr' })
syncRef(toRef(mergedProps.value, 'loadChildrenConfig'), loadChildrenConfig, { direction: 'ltr' })
syncRef(toRef(mergedProps.value, 'collapseConfig'), collapseConfig, { direction: 'ltr' })
syncRef(toRef(mergedProps.value, 'selectionConfig'), selectionConfig, { direction: 'ltr' })
syncRef(toRef(mergedProps.value, 'sortingConfig'), sortingConfig, { direction: 'ltr' })

// Init keyboard navigation
if (!props.noKeyboard) {
  useTreeKeyboard()
}

// Emits
storeEmits.value = {
  nodeClick: payload => emits('click:node', payload),
  nodeFocus: payload => emits('focus:node', payload),
  nodeBlur: payload => emits('blur:node', payload),
  nodeSelect: payload => emits('select:node', payload),
  nodeUnselect: payload => emits('unselect:node', payload),
  nodeHover: payload => emits('hover:node', payload),
}

defineExpose(treeGetExposed())

// Init
await init()

// Styles - Container
const containerClass = computed(() => {
  return mergedProps.value.ui?.containerClass?.({
    defaults: TREE_DEFAULT_PROPS.ui.containerClass(),
  })
})

const containerStyle = computed(() => {
  return mergedProps.value.ui?.containerStyle?.()
})

// Styles - Content
const contentClass = computed(() => {
  return mergedProps.value.ui?.contentClass?.({
    defaults: TREE_DEFAULT_PROPS.ui.contentClass(),
  })
})

const contentStyle = computed(() => {
  return mergedProps.value.ui?.contentStyle?.()
})
</script>

<template>
  <div
    ref="treeEl"
    class="tree"
    :class="containerClass"
    :style="containerStyle"
  >
    <slot
      v-if="searchConfig?.enabled"
      name="search"
      :ui="mergedProps.ui"
      :search-config="mergedProps.searchConfig"
      :actions-config="mergedProps.actionsConfig"
    >
      <TreeSearch
        v-model:search="search"
        :search-config="mergedProps.searchConfig"
        :actions-config="mergedProps.actionsConfig"
        :ui="mergedProps.ui"
      >
        <template #actions>
          <slot name="actions" />
        </template>
      </TreeSearch>
    </slot>

    <VirtualScrollerVertical
      v-if="!loading"
      ref="scrollerEl"
      class="tree__content"
      :rows="(nodesVisible as T[])"
      :class="contentClass"
      :style="contentStyle"
      v-bind="mergedProps.scrollerConfig"
      :row-height="mergedProps.scrollerConfig?.rowHeight"
    >
      <template #default="{ row, index }">
        <TreeNode
          :node="(row as unknown as ITreeNode<T>)"
          :index
          :connectors
          :ui="mergedProps.ui"
          :node-el
        >
          <template #content>
            <slot
              name="node"
              :node="(row as unknown as ITreeNode<T>)"
              :index
            />
          </template>
        </TreeNode>
      </template>

      <!-- Drop indicator -->
      <template #inner-content>
        <TreeDropIndicator v-if="dndConfig?.enabled" />
      </template>

      <template #inner>
        <slot name="no-data">
          <TreeNoData
            v-if="nodesVisible.length === 0 && !loading"
            :ui="mergedProps.ui"
          />
        </slot>
        <slot name="content-inner" />
      </template>
    </VirtualScrollerVertical>

    <slot name="loading">
      <TreeLoading v-if="loading" />
    </slot>

    <slot name="inner" />
  </div>
</template>

<style scoped>
.tree {
  @apply flex flex-col overflow-auto;
}

.tree__content {
  @apply flex flex-col grow overflow-auto;
}
</style>

<script setup lang="ts" generic="T extends IItem = IItem">
// Types
import type { ITreeNode } from './types/tree-node.new.type'
import type { ITreeEmits } from './types/tree-emits.new.type'
import type { ITreeProps } from './types/tree-props.new.type'

// Composables
import { useTreeKeyboard } from './composables/useTreeKeyboard.new'

// Functions
import { treeGetExposed } from './functions/tree-get-exposed.new'
import { getComponentMergedProps, getComponentProps } from '../../functions/get-component-props'

// Store
import { useTreeStore } from './stores/tree.store.new'

// Constants
import { TREE_INJECTION_KEY } from './constants/tree-injection-key.constant'
import { TREE_NEW_DEFAULT_PROPS } from './constants/tree-new-default-props.constant'

const props = withDefaults(
  defineProps<ITreeProps<T>>(),
  { ...getComponentProps('treeNew') },
)

const emits = defineEmits<ITreeEmits<T>>()

// Init
provideLocal(TREE_INJECTION_KEY, generateUUID())

// Utils
const mergedProps = computed(() => {
  return getComponentMergedProps('treeNew', props) as ITreeProps<T>
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
    defaults: TREE_NEW_DEFAULT_PROPS.ui.containerClass(),
  })
})

const containerStyle = computed(() => {
  return mergedProps.value.ui?.containerStyle?.()
})

// Styles - Content
const contentClass = computed(() => {
  return mergedProps.value.ui?.contentClass?.({
    defaults: TREE_NEW_DEFAULT_PROPS.ui.contentClass(),
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
      <TreeSearchNew
        v-model:search="search"
        :search-config="mergedProps.searchConfig"
        :actions-config="mergedProps.actionsConfig"
        :ui="mergedProps.ui"
      >
        <template #actions>
          <slot name="actions" />
        </template>
      </TreeSearchNew>
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
        <TreeNodeNew
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
        </TreeNodeNew>
      </template>

      <!-- Drop indicator -->
      <template #inner-content>
        <TreeDropIndicatorNew v-if="dndConfig?.enabled" />
      </template>

      <template #inner>
        <slot name="content-inner" />
      </template>
    </VirtualScrollerVertical>

    <slot name="no-data">
      <TreeNoData
        v-if="nodesVisible.length === 0 && !loading"
        :ui="mergedProps.ui"
      />
    </slot>

    <slot name="loading">
      <TreeLoading v-if="loading" />
    </slot>

    <slot name="inner" />
  </div>
</template>

<style scoped>
.tree {
  @apply flex flex-col overflow-auto;

  &__content {
    @apply flex flex-col grow overflow-auto;
  }
}
</style>

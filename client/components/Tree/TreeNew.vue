<script setup lang="ts">
// Types
import type { ITreeProps } from './types/tree-props.new.type'

// Functions
import { getComponentMergedProps, getComponentProps } from '../../functions/get-component-props'

// Store
import { useTreeStore } from './stores/tree.store.new'

// Constants
import { TREE_INJECTION_KEY } from './constants/tree-injection-key.constant'

const props = withDefaults(defineProps<ITreeProps>(), {
  ...getComponentProps('treeNew'),
})

// Init
provideLocal(TREE_INJECTION_KEY, generateUUID())

// Utils
const mergedProps = computed(() => {
  return getComponentMergedProps('treeNew', props)
})

// Store
const { search, nodesVisible } = useTreeStore({ treeProps: props })
</script>

<template>
  <div
    class="tree"
    :class="mergedProps.ui?.treeClass"
    :style="mergedProps.ui?.treeStyle"
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

    <div
      class="tree__content"
      :class="mergedProps.ui?.treeContentClass"
      :style="mergedProps.ui?.treeContentStyle"
    >
      <TreeNodeNew
        v-for="(node, index) in nodesVisible"
        :key="node.id"
        :node
        :index
        :ui="mergedProps.ui"
      />
    </div>
  </div>
</template>

<style scoped>
.tree {
  @apply flex flex-col;

  &__content {
    @apply flex flex-col grow;
  }
}
</style>

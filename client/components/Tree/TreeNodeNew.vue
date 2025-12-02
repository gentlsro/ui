<script setup lang="ts" generic="T extends IItem = IItem">
// Types
import type { ITreeNodeProps } from './types/tree-node-props.type'

// Composables
import { useTreeNode } from './composables/useTreeNode'

const props = defineProps<ITreeNodeProps<T>>()

// Utils
const {
  isSearched,
  isCollapsed,
  treeNodeStyle,
  treeNodeClass,
  nodeClass,
  nodeStyle,
  nodeContentClass,
  nodeContentStyle,
} = useTreeNode(props)

// Layout
const treeNodeEl = useTemplateRef('treeNodeEl')
const node = toRef(props, 'node') as Ref<ITreeNode<IItem>>
</script>

<template>
  <div
    ref="treeNodeEl"
    class="tree-node"
    :class="[treeNodeClass, nodeClass]"
    :style="[treeNodeStyle, nodeStyle]"
  >
    <TreeCollapseBtn
      v-if="!isSearched"
      :node
    />

    <div
      class="tree-node__content"
      :class="nodeContentClass"
      :style="nodeContentStyle"
    >
      {{ node.id }}: {{ node.label }}
    </div>
  </div>
</template>

<style scoped lang="scss">
.tree-node {
  @apply flex;

  margin-left: calc(var(--level) * var(--treePadding));

  &__content {
    @apply p-2;
  }
}
</style>

<script setup lang="ts" generic="T extends IItem = IItem">
// Types
import type { ITreeNode } from './types/tree-node.new.type'
import type { ITreeNodeProps } from './types/tree-node-props.type'

// Composables
import { useTreeNode } from './composables/useTreeNode'
import { useTreeDragAndDrop } from './composables/useTreeDragAndDrop.new'

// Functions
import { selectNode } from './functions/select-node'

const props = defineProps<ITreeNodeProps<T>>()

// Utils
const { createDraggable } = useTreeDragAndDrop()

const {
  emits,
  isDndEnabled,
  isSearched,
  treeNodeStyle,
  treeNodeClass,
  nodeClass,
  nodeStyle,
  nodeContentClass,
  nodeContentStyle,
  nodePath,
  hasMultiSelect,
  nodeMeta,
  getStore,
} = useTreeNode(props)

// Layout
const treeNodeEl = useTemplateRef('treeNodeEl')
const treeCollapseBtnEl = useTemplateRef('treeCollapseBtnEl')
const node = toRef(props, 'node') as Ref<ITreeNode<T>>
const isPreventClick = refAutoReset(false, 100)

function handleClick(ev: MouseEvent) {
  if (isPreventClick.value) {
    return
  }

  emits.value.nodeClick({ node: node.value, ev })

  const isRightClick = ev.button === 2
  if (hasMultiSelect.value || isRightClick) {
    return
  }

  selectNode({ node: node.value, ev, getStore })
}

// D'n'D
onMounted(() => {
  if (!isDndEnabled.value) {
    return
  }

  nextTick(() => {
    // @ts-expect-error
    const _el = unrefElement(treeNodeEl) as HTMLElement

    createDraggable({
      el: _el,
      item: node.value,

      // When dragging happened (`onEnd` is called), we want to prevent the click
      onEnd: () => {
        isPreventClick.value = true
      },
    })
  })
})
</script>

<template>
  <Component
    :is="nodeEl ?? 'div'"
    ref="treeNodeEl"
    class="tree-node"
    :data-id="node.id"
    :data-path="nodeMeta?.path"
    :class="[treeNodeClass, nodeClass]"
    :style="[treeNodeStyle, nodeStyle]"
    @click="handleClick"
    @contextmenu="handleClick"
  >
    <!-- Collapse -->
    <TreeCollapseBtn
      v-if="!isSearched"
      ref="treeCollapseBtnEl"
      :node
    />

    <!-- Multi-select -->
    <TreeSelectCheckbox
      v-if="hasMultiSelect"
      :node
    />

    <!-- Content -->
    <div
      class="tree-node__content"
      :class="nodeContentClass"
      :style="nodeContentStyle"
    >
      <slot name="content">
        <span class="tree-node__content-label">
          {{ node.id }}: {{ node.label }}
        </span>

        <span
          v-if="nodePath && isSearched"
          class="tree-node__content-path"
        >
          {{ nodePath }}
        </span>
      </slot>
    </div>

    <!-- Connectors -->
    <template v-if="!isSearched && connectors">
      <div
        v-for="idx in Math.max(0, nodeMeta?.level ?? 0)"
        :key="idx"
        class="tree-node__connector"
        :class="{ 'horizontal-connector': !!treeCollapseBtnEl }"
        :style="{ '--level': (nodeMeta?.level ?? 0) - idx }"
      />
    </template>
  </Component>
</template>

<style scoped lang="scss">
.tree-node {
  @apply relative flex;

  margin-left: calc(var(--level) * var(--treePadding));

  &.is-selectable {
    @apply cursor-pointer;
  }

  &__content {
    &-label {
      @apply font-rem-14;
    }

    &-path {
      @apply text-caption leading-tight font-rem-12;
    }
  }

  &__connector {
    @apply absolute inset-0 pointer-events-none;

    &::before {
      @apply content-empty absolute top-0 h-full border-l-1 border-ca border-dashed;

      left: calc(calc(-1 * var(--level) * var(--treePadding)) + 4px);
    }

    &.horizontal-connector::after {
      @apply content-empty absolute border-t-1 border-ca border-dashed;
      top: min(24px, 50%);
      left: 4px;

      width: calc(var(--treePadding) - 8px);
    }
  }
}
</style>

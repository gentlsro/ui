<script setup lang="ts" generic="T extends IItem = IItem">
// Types
import type { ITreeNode } from './types/tree-node.new.type'
import type { ITreeNodeProps } from './types/tree-node-props.type'

// Composables
import { useTreeNode } from './composables/useTreeNode'
import { useTreeDragAndDrop } from './composables/useTreeDragAndDrop.new'

// Functions
import { selectNode } from './functions/select-node'

// Constants
import { TREE_NEW_DEFAULT_PROPS } from './constants/tree-new-default-props.constant'

defineOptions({ inheritAttrs: false })
const props = defineProps<ITreeNodeProps<T>>()
// Utils
const { createDraggable } = useTreeDragAndDrop()

const {
  emits,
  isDndEnabled,
  isSearched,
  treeNodeStyle,
  treeNodeClass,
  nodePath,
  hasMultiSelect,
  nodeMeta,
  nodeHovered,
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

function handleMouseEnter() {
  nodeHovered.value = node.value
}

function handleMouseLeave() {
  nodeHovered.value = undefined
}

// Styles - Node
const nodeClass = computed(() => {
  return props.ui?.nodeClass?.({
    defaults: TREE_NEW_DEFAULT_PROPS.ui.nodeClass(),
    node: node.value as any,
    index: props.index,
  })
})

const nodeStyle = computed(() => {
  return props.ui?.nodeStyle?.({
    node: node.value as any,
    index: props.index,
  })
})

// Styles - Node Content
const nodeContentClass = computed(() => {
  return props.ui?.nodeContentClass?.({
    defaults: TREE_NEW_DEFAULT_PROPS.ui.nodeContentClass(),
    node: node.value as any,
    index: props.index,
  })
})

const nodeContentStyle = computed(() => {
  return props.ui?.nodeContentStyle?.({
    node: node.value as any,
    index: props.index,
  })
})

// D'n'D
onMounted(() => {
  if (!isDndEnabled.value) {
    return
  }

  nextTick(() => {
    const _el = unrefElement(treeNodeEl as any) as HTMLElement

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
    class="tree-node group/node"
    v-bind="$attrs"
    :data-id="node.id"
    :data-path="nodeMeta?.path"
    :class="[treeNodeClass, nodeClass]"
    :style="[treeNodeStyle, nodeStyle]"
    @click="handleClick"
    @contextmenu="handleClick"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
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
          {{ node.label ?? node.id }}
        </span>

        <span
          v-if="nodePath && isSearched"
          class="tree-node__content-path"
        >
          {{ nodePath }}
        </span>
      </slot>
    </div>
  </Component>

  <!-- Connectors -->
  <template v-if="!isSearched && connectors">
    <div
      v-for="idx in Math.max(0, nodeMeta?.level ?? 0)"
      :key="idx"
      class="tree-node__connector"
      :class="{ 'horizontal-connector': !!treeCollapseBtnEl }"
      :style="{ '--level': idx, '--treePadding': ui?.nodePadding }"
    />
  </template>
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
}

.tree-node__connector {
  @apply absolute z--1 top-0 bottom-0 border-l-1 border-ca border-dashed pointer-events-none;
  left: calc(calc(var(--level) * var(--treePadding)));

  // &::before {
  //   @apply content-empty absolute top-0 h-full border-l-1 border-ca border-dashed;

  //   left: calc(calc(var(--level) * var(--treePadding)));
  // }

  // &.horizontal-connector::after {
  //   @apply content-empty absolute border-t-1 border-ca border-dashed;
  //   top: min(24px, 50%);
  //   left: 4px;

  //   width: calc(var(--treePadding) - 12px);
  // }
}
</style>

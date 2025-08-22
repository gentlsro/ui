<script setup lang="ts" generic="T extends IItem = IItem">
// Types
import type { ITreeProps } from './types/tree-props.type'

// Functions
import { useTreeStore } from './stores/tree.store'
import { getParents } from './functions/get-parents'
import { useTreeDragAndDrop } from './composables/useTreeDragAndDrop'

type IProps = {
  connectors?: boolean
  node: ITreeNode<T>
  nodeEl?: ITreeProps<T>['nodeEl']
  ui?: ITreeProps<T>['ui']
}

const props = defineProps<IProps>()

// Utils
const { createDraggable } = useTreeDragAndDrop()

// Store
const treeStore = useTreeStore()
const {
  nodeMetaById,
  isSearched,
  selectionConfig,
  nodeFocused,
  loadingByNodeId,
  maxLevel,
  childrenKey,
  collapsingConfig,
  emits,
  dndConfig,
  nodeById,
} = storeToRefs(treeStore)

// Layout
const treeNodeEl = useTemplateRef('treeNodeEl')
const node = toRef(props, 'node') as Ref<ITreeNode<T>>

const isLoading = computed(() => {
  return loadingByNodeId.value[node.value.id] ?? false
})

const nodeMeta = computed(() => {
  return nodeMetaById.value[node.value.id]
})

const isCollapsed = computed(() => {
  return nodeMetaById.value[node.value.id]?.collapsed ?? true
})

const treeNodeStyle = computed(() => {
  return {
    '--level': nodeMeta.value?.level,
    '--treePadding': isSearched.value ? '0' : props.ui?.nodePadding,
  }
})

const treeNodeClass = computed(() => {
  return {
    'is-collapsed': isCollapsed.value,
    'is-searched': isSearched.value,
    'is-selected': isSelected.value,
    'is-multi': selectionConfig.value?.multi,
    'is-selectable': selectionConfig.value?.enabled && !selectionConfig.value?.multi,
    'is-focused': nodeFocused.value?.id === node.value.id,
    'is-open': !isCollapsed.value,
  }
})

const nodeChildren = computed(() => {
  const _node = nodeById.value[node.value.id]

  return get(_node, childrenKey.value)
})

const collapseBtnClass = computed(() => {
  const {
    hasChildrenFnc,
    collapseBtnTakesSpace,
  } = collapsingConfig.value ?? {}

  const hasChildren = hasChildrenFnc?.(node.value)

  if (!isNil(hasChildren)) {
    return hasChildren
      ? 'visible'
      : collapseBtnTakesSpace ? 'invisible' : '!hidden'
  }

  const hasPossiblyChildren = isNil(nodeChildren)
    || (!nodeMeta.value?.childrenLoaded && !nodeChildren.value)
    || nodeChildren.value?.length

  const isMaxLevel = nodeMeta.value?.level === maxLevel.value

  return hasPossiblyChildren && !isMaxLevel
    ? 'visible'
    : collapseBtnTakesSpace ? 'invisible' : '!hidden'
})

const path = computed(() => {
  const parents = getParents(node.value, nodeMetaById.value)

  return {
    path: nodeMeta.value?.path,
    pathLabel: parents.toReversed().map(p => p.name).join(' > '),
  }
})

// Selection
const isSelected = computed(() => {
  return treeStore.isSelected(node.value)
})

function handleSelect() {
  treeStore.handleSelect({ node: node.value })
}

function handleClickNode(ev: MouseEvent) {
  if (!selectionConfig.value?.multi) {
    treeStore.handleSelect({ node: node.value, ev })
  }
}

function handleContextMenu(ev: MouseEvent) {
  emits.value.nodeContextMenu({ node: node.value, ev })
}

// Collapsing
async function handleToggleCollapse() {
  if (isLoading.value) {
    return
  }

  treeStore.toggleCollapse(node.value)
}

const nodeClass = computed(() => {
  return typeof props.ui?.nodeClass === 'function'
    ? props.ui.nodeClass({ node: node.value, isSelected: isSelected.value })
    : props.ui?.nodeClass
})

const nodeStyle = computed(() => {
  return typeof props.ui?.nodeStyle === 'function'
    ? props.ui.nodeStyle({ node: node.value, isSelected: isSelected.value })
    : props.ui?.nodeStyle
})

// D'n'D
onMounted(() => {
  if (!dndConfig.value?.enabled) {
    return
  }

  nextTick(() => {
    // @ts-expect-error
    const _el = unrefElement(treeNodeEl) as HTMLElement

    createDraggable({
      el: _el,
      item: node.value,
    })
  })
})
</script>

<template>
  <Component
    :is="nodeEl ?? 'div'"
    ref="treeNodeEl"
    class="tree-node"
    :class="[treeNodeClass, nodeClass]"
    :style="[treeNodeStyle, nodeStyle]"
    :data-id="node.id"
    :data-path="path.path"
    @click="handleClickNode"
    @contextmenu="handleContextMenu"
  >
    <slot
      :collapse="handleToggleCollapse"
      :level="nodeMeta?.level"
    >
      <!-- Collapse btn -->
      <Btn
        v-if="!isSearched"
        size="xs"
        icon="i-flowbite:chevron-right-outline !h-5 !w-5"
        color="ca"
        class="collapse-btn self-start m-t-1"
        :class="[collapseBtnClass, ui?.collapseBtnClass]"
        :style="ui?.collapseBtnStyle"
        :loading="isLoading"
        @click.stop.prevent="handleToggleCollapse"
      />

      <!-- Multi-select -->
      <Checkbox
        v-if="selectionConfig?.enabled && selectionConfig?.multi"
        size="sm"
        :model-value="isSelected"
        @update:model-value="handleSelect"
        @click.stop.prevent
      />

      <slot
        name="node-content"
        :collapse="handleToggleCollapse"
        :level="nodeMeta?.level"
      >
        <div class="tree-node__content">
          <span class="tree-node__content-label">
            {{ node.name }}
          </span>

          <span
            v-if="isSearched"
            class="tree-node__content-path"
          >
            {{ path.pathLabel }}
          </span>
        </div>
      </slot>
    </slot>

    <!-- Connectors -->
    <template v-if="!isSearched && connectors">
      <div
        v-for="idx in Math.max(0, nodeMeta?.level ?? 0)"
        :key="idx"
        class="tree-node__connector"
        :class="{ 'horizontal-connector': collapseBtnClass === 'invisible' }"
        :style="{ '--level': (nodeMeta?.level ?? 0) - idx }"
      />
    </template>
  </Component>
</template>

<style lang="scss" scoped>
.tree-node {
  @apply flex relative items-center p-l-1 rounded-r-2;

  margin-left: calc(var(--level) * var(--treePadding));

  &__content {
    @apply relative flex flex-col p-x-2 p-y-1;

    &-path {
      @apply text-caption leading-tight font-rem-12;
    }
  }

  &__connector {
    @apply absolute inset-0 pointer-events-none;

    &::before {
      @apply content-empty absolute top-0 h-full border-l-1 border-ca border-dashed;

      left: calc(-1 * var(--level) * var(--treePadding));
    }

    &.horizontal-connector::after {
      @apply content-empty absolute border-t-1 border-ca border-dashed;
      top: min(24px, 50%);

      width: var(--treePadding);
    }
  }

  &.is-selected:not(.is-multi) {
    .tree-node__content {
      @apply p-x-3;

      &::before {
        @apply content-empty absolute left-0 top-0 h-full w-1 bg-primary rounded-l-custom;
      }

      &::after {
        @apply content-empty absolute right-0 top-0 h-full w-1 bg-primary rounded-r-custom;
      }
    }
  }

  &.is-selectable {
    @apply cursor-pointer;

    &:hover::before {
      @apply content-empty absolute inset-0 rounded-inherit
        border-1 border-primary border-dashed;
    }
  }

  &.is-focused {
    &::before {
      @apply content-empty absolute inset-0 rounded-inherit
        border-1 border-primary border-dashed;
    }
  }

  :deep(.collapse-btn .icon) {
    @apply transition-transform;
  }

  &:not(.is-collapsed) {
    :deep(.collapse-btn .icon) {
      @apply rotate-90;
    }
  }
}
</style>

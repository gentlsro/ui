<script setup lang="ts">
// Types
import type { ITreeProps } from './types/tree-props.type'

// Functions
import { useTreeStore } from './stores/tree.store'
import { getParents } from './functions/get-parents'

type IProps = {
  connectors?: boolean
  node: ITreeNode
  nodeEl?: ITreeProps['nodeEl']
  ui?: ITreeProps['ui']
}

const props = defineProps<IProps>()

// Store
const treeStore = useTreeStore()
const {
  nodeMetaById,
  isSearched,
  selectionConfig,
  nodeFocused,
  loadingByNodeId,
  maxLevel,
} = storeToRefs(treeStore)

// Layout
const node = toRef(props, 'node')

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
  }
})

const collapseBtnClass = computed(() => {
  const hasPossiblyChildren = isNil(node.value.children)
    || (!nodeMeta.value?.childrenLoaded && !node.value.children)
    || node.value.children?.length

  const isMaxLevel = nodeMeta.value?.level === maxLevel.value

  return hasPossiblyChildren && !isMaxLevel
    ? 'visible'
    : 'invisible'
})

const path = computed(() => {
  const parents = getParents(node.value, nodeMetaById.value)

  return parents.toReversed().map(p => p.name).join(' > ')
})

// Selection
const isSelected = computed(() => {
  return treeStore.isSelected(node.value)
})

function handleSelect() {
  treeStore.handleSelect(node.value)
}

function handleClickNode() {
  if (selectionConfig.value?.enabled && !selectionConfig.value?.multi) {
    handleSelect()
  }
}

// Collapsing
async function handleToggleCollapse() {
  if (isLoading.value) {
    return
  }

  treeStore.toggleCollapse(node.value)
}
</script>

<template>
  <Component
    :is="nodeEl ?? 'div'"
    class="tree-node"
    :class="[treeNodeClass, ui?.nodeClass]"
    :style="[treeNodeStyle, ui?.nodeStyle]"
    @click="handleClickNode"
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
        class="collapse-btn"
        :class="collapseBtnClass"
        :loading="isLoading"
        @click.stop.prevent="handleToggleCollapse"
      />

      <!-- Multi-select -->
      <Checkbox
        v-if="selectionConfig.enabled && selectionConfig?.multi"
        size="sm"
        :model-value="isSelected"
        @update:model-value="handleSelect"
        @click.stop.prevent
      />

      <div class="tree-node__content">
        <span class="tree-node__content-label">
          {{ node.name }}
        </span>

        <span
          v-if="isSearched"
          class="tree-node__content-path"
        >
          {{ path }}
        </span>
      </div>
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
  @apply flex relative items-center p-l-1 rounded-2;

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
      @apply content-empty absolute top-1/2 border-t-1 border-ca border-dashed;

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

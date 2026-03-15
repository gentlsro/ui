<script setup lang="ts" generic="T extends IItem = IItem">
// Types
import type { ITreeNode } from './types/tree-node.type'

// Functions
import { toggleNodeCollapse } from './functions/toggle-node-collapse'

// Store
import { useTreeStore } from './stores/tree.store'

type IProps = {
  node: ITreeNode<T>
}

const props = defineProps<IProps>()

// Store
const store = useTreeStore()
const {
  nodeMetaById,
  childrenKey,
  collapseConfig,
  maxLevel,
} = store

// Layout
const nodeMeta = computed(() => {
  return nodeMetaById.value[props.node.id]
})

const collapseBtnClass = computed(() => {
  if (!nodeMeta.value) {
    return
  }

  const { isChildrenLoaded, level } = nodeMeta.value
  const { btnTakesSpace } = collapseConfig.value ?? {}

  // Over max depth level
  const isOverMaxLevel = level >= (maxLevel.value ?? Number.MAX_SAFE_INTEGER)

  if (isOverMaxLevel) {
    return 'hidden'
  }

  // Check if has children
  const hasChildren = !isChildrenLoaded || get(props.node.ref, childrenKey.value)?.length

  if (hasChildren) {
    return 'visible'
  }

  return btnTakesSpace ? 'invisible' : '!hidden'
})

function handleToggleCollapse() {
  toggleNodeCollapse({ node: props.node, getStore: () => store })
}
</script>

<template>
  <Btn
    v-bind="collapseConfig?.btnProps"
    icon="i-flowbite:chevron-right-outline !h-5 !w-5"
    class="tree-collapse-btn"
    :class="collapseBtnClass"
    :loading="nodeMeta?.isLoading"
    @mousedown.stop.prevent
    @click.stop.prevent="handleToggleCollapse"
  />
</template>

<style scoped>
.tree-node:not(.is-collapsed) {
  .tree-collapse-btn {
    @apply rotate-90;
  }
}
</style>

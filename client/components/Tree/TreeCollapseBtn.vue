<script setup lang="ts">
// Store
import { useTreeStore } from './stores/tree.store.new'

type IProps = {
  node: ITreeNode<IItem>
}

const props = defineProps<IProps>()

// Store
const {
  nodeMetaById,
  collapseBtnProps,
  childrenKey,
  collapsingConfig,
  maxLevel,
} = useTreeStore()

// Layout
const nodeMeta = computed(() => {
  return nodeMetaById.value[props.node.id]
})

const collapseBtnClass = computed(() => {
  if (!nodeMeta.value) {
    return
  }

  const { isChildrenLoaded, level } = nodeMeta.value
  const { collapseBtnTakesSpace } = collapsingConfig.value ?? {}

  // Over max depth level
  const isOverMaxLevel = level >= (maxLevel.value ?? Number.MAX_SAFE_INTEGER)

  if (isOverMaxLevel) {
    return 'hidden'
  }

  // Check if has children
  const hasChildren = !isChildrenLoaded || get(props.node, childrenKey.value)?.length
  console.log('🚀 ~ hasChildren:', props.node.id, hasChildren)

  if (hasChildren) {
    return 'visible'
  }

  return collapseBtnTakesSpace ? 'invisible' : '!hidden'
})

function handleToggleCollapse() {
  if (nodeMetaById.value[props.node.id]) {
    nodeMetaById.value[props.node.id]!.isCollapsed = !nodeMeta.value?.isCollapsed
    nodeMetaById.value[props.node.id]!.isChildrenLoaded = true
  }
}
</script>

<template>
  <Btn
    v-bind="collapseBtnProps"
    icon="i-flowbite:chevron-right-outline !h-5 !w-5"
    class="tree-collapse-btn"
    :class="collapseBtnClass"
    @click="handleToggleCollapse"
  />
</template>

<style scoped>
.tree-node:not(.is-collapsed) {
  .tree-collapse-btn {
    @apply rotate-90;
  }
}
</style>

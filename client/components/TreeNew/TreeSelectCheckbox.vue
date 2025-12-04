<script setup lang="ts">
// Types
import type { ITreeNode } from './types/tree-node.new.type'
import type { ITreeProps } from './types/tree-props.new.type'

// Store
import { useTreeStore } from './stores/tree.store.new'

// Functions
import { selectNode } from './functions/select-node'
import { isNodeSelected } from './functions/is-node-selected'

type IProps = Pick<ITreeProps, 'ui'> & {
  node: ITreeNode<IItem>
}

const props = defineProps<IProps>()

// Layout
const store = useTreeStore()
const { selection, selectionConfig } = store

const isSelected = computed(() => {
  return isNodeSelected({
    node: props.node,
    selection: selection.value,
    idKey: 'id',
  })
})

function handleSelect() {
  selectNode({ node: props.node, getStore: () => store })
}
</script>

<template>
  <Checkbox
    v-bind="selectionConfig?.checkboxProps"
    :class="ui?.selectCheckboxClass"
    :style="ui?.selectCheckboxStyle"
    :model-value="isSelected"
    @update:model-value="handleSelect"
  />
</template>

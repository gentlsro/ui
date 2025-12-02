<script setup lang="ts" generic="T extends IItem = IItem">
// Types
import type { ITreeProps } from './types/tree-props.new.type'

// Functions
import { treeCollapseAll } from './functions/tree-collapse-all'
import { treeExpandAll } from './functions/tree-expand-all'

// Store
import { useTreeStore } from './stores/tree.store.new'

type IProps = Pick<ITreeProps<T>, 'ui' | 'actionsConfig'>

defineProps<IProps>()

// Store
const { nodeMetaById } = useTreeStore()
</script>

<template>
  <div
    class="tree__actions"
    :class="ui?.treeActionsClass"
    :style="ui?.treeActionsStyle"
  >
    <!-- Collapse all -->
    <Btn
      size="xs"
      icon="i-codicon:collapse-all !w-4 !h-4"
      :tooltip="{ label: $t('general.collapseAll') }"
      v-bind="actionsConfig?.btnProps"
      @click="treeCollapseAll({ nodeMetaById })"
    />

    <!-- Expand all -->
    <Btn
      size="xs"
      icon="i-codicon:expand-all !w-4 !h-4"
      :tooltip="{ label: $t('general.expandAll') }"
      v-bind="actionsConfig?.btnProps"
      @click="treeExpandAll({ nodeMetaById })"
    />
  </div>
</template>

<style scoped lang="scss">
.tree__actions {
  @apply flex gap-1 items-center;
}
</style>

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
const store = useTreeStore()
</script>

<template>
  <div
    class="tree__actions"
    :class="ui?.treeActionsClass"
    :style="ui?.treeActionsStyle"
  >
    <slot name="left" />

    <!-- Collapse all -->
    <Btn
      icon="i-codicon:collapse-all"
      :tooltip="{ label: $t('general.collapseAll') }"
      v-bind="actionsConfig?.btnProps"
      @click="treeCollapseAll({ getStore: () => store })"
    />

    <!-- Expand all -->
    <Btn
      icon="i-codicon:expand-all"
      :tooltip="{ label: $t('general.expandAll') }"
      v-bind="actionsConfig?.btnProps"
      @click="treeExpandAll({ getStore: () => store })"
    />

    <slot name="right" />
  </div>
</template>

<script setup lang="ts" generic="T extends IItem = IItem">
// Types
import type { ITreeProps } from './types/tree-props.type'

// Functions
import { treeCollapseAll } from './functions/tree-collapse-all'
import { treeExpandAll } from './functions/tree-expand-all'

// Store
import { useTreeStore } from './stores/tree.store'

// Constants
import { TREE_DEFAULT_PROPS } from './constants/tree-default-props.constant'

type IProps = Pick<ITreeProps<T>, 'ui' | 'actionsConfig'>

const props = defineProps<IProps>()

// Store
const store = useTreeStore()

// Styles - Actions
const actionsClass = computed(() => {
  return props.ui?.actionsClass?.({
    defaults: TREE_DEFAULT_PROPS.ui.actionsClass(),
  })
})

const actionsStyle = computed(() => {
  return props.ui?.actionsStyle?.()
})
</script>

<template>
  <div
    class="tree__actions"
    :class="actionsClass"
    :style="actionsStyle"
  >
    <slot name="prepend" />

    <!-- Collapse all -->
    <Btn
      icon="i-codicon:collapse-all"
      size="xs"
      :tooltip="{ label: $t('general.collapseAll') }"
      v-bind="actionsConfig?.btnProps"
      @click="treeCollapseAll({ getStore: () => store })"
    />

    <!-- Expand all -->
    <Btn
      icon="i-codicon:expand-all"
      size="xs"
      :tooltip="{ label: $t('general.expandAll') }"
      v-bind="actionsConfig?.btnProps"
      @click="treeExpandAll({ getStore: () => store })"
    />

    <slot name="append" />
  </div>
</template>

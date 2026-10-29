<script setup lang="ts" generic="T extends IItem = IItem">
// Types
import type { IPivotDataItem } from './types/pivot-data-item.type'
import type { IPivotRowItemCell } from './types/pivot-row-item-cell.type'

// Store
import { usePivotStore } from './stores/pivot.store'

// Constants
import { PIVOT_DEFAULT_PROPS } from './constants/pivot-default-props.constant'

/**
 * The pinned row while rows scroll by underneath: only the labels of the groups the rows below belong to (in their
 * level columns, with their collapse buttons), never the pinned row's own values
 */
type IProps = {
  row: IPivotDataItem<T>
}

const props = defineProps<IProps>()

const { ui, getRowContextLevels } = usePivotStore<T>()

const contextLevels = computed(() => getRowContextLevels(props.row))

// Context labels render as promoted labels on otherwise empty cells
const cells = computed<IPivotRowItemCell<T>[]>(() => {
  return props.row.rowItem.cells.map(cell => {
    return cell.kind === 'valueLabel'
      ? { ...cell, label: '' }
      : { ...cell, kind: 'empty' as const }
  })
})

const rowItemClass = computed(() => {
  return ui.value?.rowItemClass?.({
    defaults: PIVOT_DEFAULT_PROPS.ui.rowItemClass(),
  })
})

const rowItemStyle = computed(() => {
  return ui.value?.rowItemStyle?.()
})
</script>

<template>
  <div
    class="pivot-row-item pivot-row-context"
    :class="[rowItemClass, { invisible: !contextLevels.length }]"
    :style="rowItemStyle"
  >
    <PivotRowItemCell
      v-for="cell in cells"
      :key="cell.id"
      :item="cell"
      :group-ids="row.groupIds"
      :group-path="row.groupPath"
      :promoted-levels="contextLevels"
    />
  </div>
</template>

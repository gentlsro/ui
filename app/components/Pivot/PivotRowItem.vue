<script setup lang="ts" generic="T extends IItem = IItem">
// Types
import type { IPivotRowItem } from './types/pivot-row-item.type'
import type { IPivotDataItem } from './types/pivot-data-item.type'

// Store
import { usePivotStore } from './stores/pivot.store'

// Constants
import { PIVOT_DEFAULT_PROPS } from './constants/pivot-default-props.constant'

type IProps = {
  row: IPivotDataItem<T>
}

const props = defineProps<IProps>()

const { ui, promotedRowLabelLevelsById, rowClickable, emits } = usePivotStore<T>()

const promotedLevels = computed(() => {
  return promotedRowLabelLevelsById.value.get(props.row.id) ?? []
})

// Styles - row item
const rowItemClass = computed(() => {
  return [
    ui.value?.rowItemClass?.({
      defaults: PIVOT_DEFAULT_PROPS.ui.rowItemClass(),
    }),
    {
      'is-subtotal': props.row.rowItem.kind === 'subtotal',
      'is-grand-total': props.row.rowItem.kind === 'grandTotal',
      'is-empty-row': props.row.rowItem.kind === 'emptyRow',
    },
  ]
})

const rowItemStyle = computed(() => {
  return ui.value?.rowItemStyle?.()
})

function handleRowClick(ev: MouseEvent | KeyboardEvent) {
  if (!rowClickable.value) {
    return
  }

  emits.value.rowClick({ ev, row: props.row })
}

function handleRowKeydown(ev: KeyboardEvent) {
  if (ev.target !== ev.currentTarget) {
    return
  }

  handleRowClick(ev)
}
</script>

<template>
  <div
    class="pivot-row-item"
    :class="[rowItemClass, { 'is-clickable': rowClickable }]"
    :style="rowItemStyle"
    :role="rowClickable ? 'row' : undefined"
    :tabindex="rowClickable ? 0 : undefined"
    :aria-label="rowClickable ? row.label : undefined"
    :aria-keyshortcuts="rowClickable ? 'Enter Space' : undefined"
    @click="handleRowClick"
    @keydown.enter.space.prevent="handleRowKeydown"
  >
    <PivotRowItemCell
      v-for="cell in row.rowItem.cells"
      :key="cell.id"
      :item="cell"
      :group-ids="row.groupIds"
      :group-path="row.groupPath"
      :promoted-levels="promotedLevels"
    />
  </div>
</template>

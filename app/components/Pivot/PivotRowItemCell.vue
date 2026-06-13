<script setup lang="ts" generic="T extends IItem = IItem">
// Types
import type { IPivotRowItemCell } from './types/pivot-row-item-cell.type'

// Functions
import { isRowItemCellCollapsible } from './functions/is-row-item-cell-collapsible'

// Constants
import { PIVOT_DEFAULT_PROPS } from './constants/pivot-default-props.constant'

// Store
import { usePivotStore } from './stores/pivot.store'

type IProps = {
  item: IPivotRowItemCell<T>
}

const props = defineProps<IProps>()

// Store
const { rows, ui, state } = usePivotStore()

const isCollapsible = computed(() => {
  return isRowItemCellCollapsible({ rows: rows.value, item: props.item })
})

const isHidden = computed(() => {
  const groupWithoutLevel = props.item.groupId.slice(2)

  return state.value.collapsedGroupIds.values()
    .some(groupId => {
      return groupWithoutLevel.startsWith(groupId.slice(2))
        && groupId !== props.item.groupId
    })
})

const cellValue = computed(() => {
  if (props.item.kind === 'empty') {
    return ''
  }

  if (props.item.kind === 'grandTotal') {
    return 'Grand Total'
  }

  const value = get(props.item.ref, props.item.row?.field as ObjectKey<T>)

  if (props.item.kind === 'subtotal') {
    return `${value} Total`
  }

  return value
})

// Styles - row item cell
const rowItemCellClass = computed(() => {
  return [
    ui.value?.rowItemCellClass?.({
      defaults: PIVOT_DEFAULT_PROPS.ui.rowItemCellClass(),
    }),
    {
      'is-collapsible': isCollapsible.value,
      'is-total': props.item.kind === 'subtotal',
      'is-grand-total': props.item.kind === 'grandTotal',
    },
  ]
})

const rowItemCellStyle = computed(() => {
  const rowItemCellStyle = ui.value?.rowItemCellStyle?.()
  const width = props.item.row?.widthResolved

  return Object.assign({}, rowItemCellStyle, { width })
})
</script>

<template>
  <div
    class="pivot-row-item-cell"
    :class="rowItemCellClass"
    :style="rowItemCellStyle"
  >
    <PivotCollapseBtn
      v-if="isCollapsible && !isHidden"
      :group-id="item.groupId"
    />

    <span
      v-if="!isHidden && cellValue !== ''"
      class="min-w-0 truncate"
    >
      {{ cellValue }}
    </span>
  </div>
</template>

<script setup lang="ts" generic="T extends IItem = IItem">
// Types
import type { IPivotValueItem } from './types/pivot-value-item.type'
import type { IPivotValueItemCell } from './types/pivot-value-item-cell.type'

// Functions
import { aggregatePivotValueCellsForColumn } from './functions/pivot-column-collapse'

// Models
import type { PivotValue } from './models/pivot-value.model'

// Store
import { usePivotStore } from './stores/pivot.store'

// Constants
import { PIVOT_DEFAULT_PROPS } from './constants/pivot-default-props.constant'

type IProps = {
  item: IPivotValueItem<T>
}

const props = defineProps<IProps>()

const { state, visibleValueColumns, ui } = usePivotStore()
const { formatNumber } = useNumber()

const displayedItem = computed(() => {
  const collapsedItems = props.item.collapsedGroupValueItems

  if (!collapsedItems) {
    return props.item
  }

  const groupId = props.item.groupIds.find(groupId => {
    return state.value.collapsedGroupIds.has(groupId)
      && collapsedItems[groupId]
  })

  return groupId ? collapsedItems[groupId]! : props.item
})

const displayedCells = computed(() => {
  const item = displayedItem.value
  const cellsByColumnId = new Map(item.cells.map(cell => [cell.columnId, cell]))

  return visibleValueColumns.value.map((column): IPivotValueItemCell<T> => {
    const existingCell = cellsByColumnId.get(column.id)

    if (existingCell) {
      return existingCell
    }

    if (column.isCollapsedGroupColumn) {
      return aggregatePivotValueCellsForColumn<T>({
        cells: item.cells as Parameters<typeof aggregatePivotValueCellsForColumn<T>>[0]['cells'],
        column: {
          id: column.id,
          columnPath: column.columnPath,
          valueField: column.valueField as ObjectKey<T>,
          value: column.value as PivotValue<T>,
        },
        formatNumber,
      })
    }

    return {
      id: `${item.id}-${column.id}`,
      kind: item.kind,
      columnId: column.id,
      columnPath: column.columnPath,
      valueField: column.valueField,
      value: column.value,
      aggregated: 0,
      formattedValue: '',
    } as IPivotValueItemCell<T>
  })
})

const valueItemClass = computed(() => {
  return [
    ui.value?.valueItemClass?.({
      defaults: PIVOT_DEFAULT_PROPS.ui.valueItemClass(),
    }),
    {
      'is-subtotal': displayedItem.value.kind === 'subtotal',
      'is-grand-total': displayedItem.value.kind === 'grandTotal',
      'is-empty-row': displayedItem.value.kind === 'emptyRow',
    },
  ]
})

const valueItemStyle = computed(() => {
  const totalWidth = visibleValueColumns.value.reduce((sum, column) => {
    return sum + (Number.parseFloat(column.width) || 0)
  }, 0)

  return {
    ...ui.value?.valueItemStyle?.(),
    minWidth: totalWidth ? `${totalWidth}px` : undefined,
    width: totalWidth ? `${totalWidth}px` : undefined,
  }
})
</script>

<template>
  <div
    class="pivot-value-item"
    :class="valueItemClass"
    :style="valueItemStyle"
  >
    <PivotValueItemCell
      v-for="cell in displayedCells"
      :key="cell.id"
      :item="cell"
    />
  </div>
</template>

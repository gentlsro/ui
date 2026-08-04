<script setup lang="ts" generic="T extends IItem = IItem">
// Types
import type { IPivotValueItem } from './types/pivot-value-item.type'
import type { IPivotValueItemCell } from './types/pivot-value-item-cell.type'

// Functions
import { aggregatePivotValueCellsForColumn } from './functions/pivot-column-collapse'

// Models
import type { PivotItem } from './models/pivot-item.model'
import { getPivotPathId } from './functions/pivot-path-id'

// Store
import { usePivotStore } from './stores/pivot.store'

// Constants
import { PIVOT_DEFAULT_PROPS } from './constants/pivot-default-props.constant'

type IProps = {
  item: IPivotValueItem<T>
}

const props = defineProps<IProps>()

const { state, visibleValueColumns, ui } = usePivotStore<T>()

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
      const activeMeasure = item.cells[0]
      const measureId = activeMeasure?.measureId ?? column.measureId
      const groupCell = item.columnGroupCells?.[`${getPivotPathId(column.columnPath)}:${measureId}`]

      if (groupCell) {
        return {
          ...groupCell,
          id: `${item.id}-${column.id}`,
          columnId: column.id,
        }
      }

      return aggregatePivotValueCellsForColumn<T>({
        cells: item.cells as Parameters<typeof aggregatePivotValueCellsForColumn<T>>[0]['cells'],
        column: {
          id: column.id,
          columnPath: column.columnPath,
          measureId,
          valueField: activeMeasure?.valueField ?? column.valueField as ObjectKey<T>,
          value: activeMeasure?.value ?? column.value as PivotItem<T>,
        },
      })
    }

    return {
      id: `${item.id}-${column.id}`,
      kind: item.kind,
      columnId: column.id,
      columnPath: column.columnPath,
      measureId: column.measureId,
      valueField: column.valueField,
      value: column.value,
      aggregated: 0,
      hasValue: false,
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
      v-for="(cell, index) in displayedCells"
      :key="cell.id"
      :item="cell"
      :column="visibleValueColumns[index]!"
    />
  </div>
</template>

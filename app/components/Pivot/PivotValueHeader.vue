<script setup lang="ts">
// Types
import type { IPivotValueHeaderCell } from './types/pivot-value-column-item.type'

// Store
import { usePivotStore } from './stores/pivot.store'

// Constants
import { PIVOT_DEFAULT_PROPS } from './constants/pivot-default-props.constant'

type IPlacedHeaderCell = {
  cell: IPivotValueHeaderCell
  columnStart: number
  columnEnd: number
  rowStart: number
  rowEnd: number
}

const { valueHeaderRows, valueColumns, valueHeaderEl, ui } = usePivotStore()

const valueHeaderClass = computed(() => {
  return ui.value?.valueHeaderClass?.({
    defaults: PIVOT_DEFAULT_PROPS.ui.valueHeaderClass(),
  })
})

const valueHeaderStyle = computed(() => {
  return ui.value?.valueHeaderStyle?.()
})

const gridTemplateColumns = computed(() => {
  return valueColumns.value
    .map(column => column.width)
    .join(' ')
})

const gridMinWidth = computed(() => {
  const totalWidth = valueColumns.value.reduce((sum, column) => {
    return sum + (Number.parseFloat(column.width) || 0)
  }, 0)

  return totalWidth ? `${totalWidth}px` : undefined
})

const placedCells = computed(() => {
  if (!valueHeaderRows.value.length) {
    return [] as IPlacedHeaderCell[]
  }

  const rowCount = valueHeaderRows.value.length
  const colCount = valueColumns.value.length
  const occupied = Array.from({ length: rowCount }, () => Array.from({ length: colCount }, () => false))
  const placed: IPlacedHeaderCell[] = []

  valueHeaderRows.value.forEach((headerRow, rowIndex) => {
    let colIndex = 0

    for (const cell of headerRow) {
      while (colIndex < colCount && occupied[rowIndex]![colIndex]) {
        colIndex++
      }

      placed.push({
        cell,
        columnStart: colIndex + 1,
        columnEnd: colIndex + cell.colspan + 1,
        rowStart: rowIndex + 1,
        rowEnd: rowIndex + cell.rowspan + 1,
      })

      for (let r = rowIndex; r < Math.min(rowIndex + cell.rowspan, rowCount); r++) {
        for (let c = colIndex; c < Math.min(colIndex + cell.colspan, colCount); c++) {
          occupied[r]![c] = true
        }
      }

      colIndex += cell.colspan
    }
  })

  return placed
})
</script>

<template>
  <div
    v-if="valueColumns.length"
    ref="valueHeaderEl"
    class="pivot-value-header"
    :class="valueHeaderClass"
    :style="valueHeaderStyle"
  >
    <div
      class="pivot-value-header__grid"
      :style="{
        display: 'grid',
        gridTemplateColumns,
        gridTemplateRows: `repeat(${valueHeaderRows.length}, auto)`,
        minWidth: gridMinWidth,
        width: gridMinWidth,
      }"
    >
      <PivotValueHeaderCell
        v-for="placed in placedCells"
        :key="placed.cell.id"
        :cell="placed.cell"
        :style="{
          gridColumn: `${placed.columnStart} / ${placed.columnEnd}`,
          gridRow: `${placed.rowStart} / ${placed.rowEnd}`,
        }"
      />
    </div>
  </div>
</template>

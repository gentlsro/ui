<script setup lang="ts">
// Types
import type { IPivotValueHeaderCell } from './types/pivot-value-column-item.type'

// Functions
import { isPivotColumnHeaderHidden } from './functions/pivot-column-collapse'
import { isValueHeaderCellCollapsible } from './functions/is-value-header-cell-collapsible'
import { getPivotGroupKeyValue } from './functions/pivot-group-key'

// Store
import { usePivotStore } from './stores/pivot.store'

// Constants
import { PIVOT_LAYERED_CLASSES } from './constants/pivot-layered-classes.constant'

type IProps = {
  cell: IPivotValueHeaderCell
}

const props = defineProps<IProps>()

const { columns, ui, state, currentLocaleCode } = usePivotStore()

const columnField = computed(() => {
  const index = props.cell.columnFieldIndex

  if (index === undefined) {
    return undefined
  }

  return columns.value[index]
})

const isCollapsible = computed(() => {
  return isValueHeaderCellCollapsible({ columns: columns.value, cell: props.cell })
})

const isHidden = computed(() => {
  if (!props.cell.groupId) {
    return false
  }

  return isPivotColumnHeaderHidden(
    props.cell.groupId,
    state.value.collapsedColumnGroupIds,
  )
})

const formattedLabel = computed(() => {
  const field = columnField.value

  if (!field) {
    return props.cell.label
  }

  // Group keys are raw (dates are day timestamps); format via the column field for Table-like display.
  return formatValue(getPivotGroupKeyValue(props.cell.label, field.dataType), undefined, {
    dataType: field.dataType,
    format: field.format,
    localeIso: currentLocaleCode.value,
    source: { type: 'component', name: 'PivotValueHeaderCell' },
  })
})

const valueHeaderCellClass = computed(() => {
  return [
    ui.value?.valueHeaderCellClass?.({
      defaults: PIVOT_LAYERED_CLASSES.valueHeaderCellClass(),
    }),
    {
      'is-collapsible': isCollapsible.value,
    },
  ]
})

const valueHeaderCellStyle = computed(() => {
  return ui.value?.valueHeaderCellStyle?.()
})
</script>

<template>
  <div
    class="pivot-value-header-cell"
    :class="valueHeaderCellClass"
    :style="valueHeaderCellStyle"
    :title="formattedLabel"
  >
    <PivotCollapseBtn
      v-if="isCollapsible && !isHidden && cell.groupId"
      :group-id="cell.groupId"
      axis="column"
    />

    <span
      v-if="!isHidden"
      class="truncate"
    >
      {{ formattedLabel }}
    </span>
  </div>
</template>

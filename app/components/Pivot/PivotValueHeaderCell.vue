<script setup lang="ts">
// Types
import type { IPivotValueHeaderCell } from './types/pivot-value-column-item.type'

// Functions
import { isPivotColumnHeaderHidden } from './functions/pivot-column-collapse'
import { isValueHeaderCellCollapsible } from './functions/is-value-header-cell-collapsible'

// Store
import { usePivotStore } from './stores/pivot.store'

// Constants
import { PIVOT_DEFAULT_PROPS } from './constants/pivot-default-props.constant'

type IProps = {
  cell: IPivotValueHeaderCell
}

const props = defineProps<IProps>()

// Utils
const { currentLocaleCode } = useLocale()

const { columns, ui, state } = usePivotStore()

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

  // Group keys are raw; format via the column field for Table-like display.
  return formatValue(props.cell.label, undefined, {
    dataType: field.dataType,
    format: field.format,
    localeIso: currentLocaleCode.value,
    source: { type: 'component', name: 'PivotValueHeaderCell' },
  })
})

const valueHeaderCellClass = computed(() => {
  return [
    ui.value?.valueHeaderCellClass?.({
      defaults: PIVOT_DEFAULT_PROPS.ui.valueHeaderCellClass(),
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

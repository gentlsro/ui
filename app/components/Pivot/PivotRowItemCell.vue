<script setup lang="ts" generic="T extends IItem = IItem">
// Types
import type { IPivotRowItemCell } from './types/pivot-row-item-cell.type'

// Functions
import { resolvePivotRowItemCell } from './functions/pivot-resolve-row-item-cell'

// Store
import { usePivotStore } from './stores/pivot.store'

type IProps = {
  item: IPivotRowItemCell<T>
  groupIds: string[]
  groupPath: string[]
  promotedLevels: number[]
}

const props = defineProps<IProps>()

// Store
const {
  rows,
  measureRowColumn,
  showMeasureColumn,
  state,
  currentLocaleCode,
  labels,
  rowItemCellUiClass,
  rowItemCellUiStyle,
} = usePivotStore<T>()

const resolved = computed(() => {
  return resolvePivotRowItemCell({
    item: props.item,
    groupIds: props.groupIds,
    groupPath: props.groupPath,
    promotedLevels: props.promotedLevels,
    rows: rows.value,
    collapsedGroupIds: state.value.collapsedGroupIds,
    localeIso: currentLocaleCode.value,
    labels: labels.value,
    formatCellValue: ({ value, row, dataType, format, localeIso }) => {
      return formatValue(value, row, {
        dataType,
        format,
        localeIso,
        source: { type: 'component', name: 'PivotRowItemCell' },
      })
    },
  })
})

// Styles - row item cell
const rowItemCellClass = computed(() => {
  return [
    rowItemCellUiClass.value,
    {
      'is-collapsible': resolved.value.isCollapsible,
      'is-total': props.item.kind === 'subtotal',
      'is-grand-total': props.item.kind === 'grandTotal',
    },
  ]
})

const rowItemCellStyle = computed(() => {
  const rowItemCellStyle = rowItemCellUiStyle.value
  let width = props.item.row?.widthResolved

  if (props.item.kind === 'valueLabel' && showMeasureColumn.value) {
    width = measureRowColumn.value.widthResolved
  }

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
      v-if="resolved.isCollapsible && !resolved.isHidden"
      :group-id="resolved.collapseGroupId"
    />

    <span
      v-if="resolved.showContent && resolved.displayValue !== ''"
      class="min-w-0 truncate"
    >
      {{ resolved.displayValue }}
    </span>
  </div>
</template>

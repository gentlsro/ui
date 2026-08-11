<script setup lang="ts" generic="T extends IItem = IItem">
// Types
import type { IPivotRowItemCell } from './types/pivot-row-item-cell.type'

// Functions
import { isRowItemCellCollapsible } from './functions/is-row-item-cell-collapsible'
import { isPivotRowCellHiddenByCollapsedAncestor } from './functions/pivot-group-collapse'

// Constants
import { PIVOT_DEFAULT_PROPS } from './constants/pivot-default-props.constant'

// Store
import { usePivotStore } from './stores/pivot.store'

type IProps = {
  item: IPivotRowItemCell<T>
  groupIds: string[]
  groupPath: string[]
  promotedLevels: number[]
}

const props = defineProps<IProps>()

// Utils
const { currentLocaleCode } = useLocale()

// Store
const { rows, measureRowColumn, showMeasureColumn, ui, state } = usePivotStore()

const isPromoted = computed(() => {
  const level = props.item.rowFieldIndex

  return level !== undefined && props.promotedLevels.includes(level)
})

const collapseGroupId = computed(() => {
  const level = props.item.rowFieldIndex

  if (isPromoted.value && level !== undefined) {
    return props.groupIds[level] ?? props.item.groupId
  }

  return props.item.groupId
})

const isCollapsible = computed(() => {
  if (props.item.kind === 'valueLabel') {
    return false
  }

  if (isPromoted.value) {
    return isRowItemCellCollapsible({
      rows: rows.value,
      item: { kind: 'rowLabel', rowFieldIndex: props.item.rowFieldIndex },
    })
  }

  return isRowItemCellCollapsible({ rows: rows.value, item: props.item })
})

const isHidden = computed(() => {
  return isPivotRowCellHiddenByCollapsedAncestor(
    collapseGroupId.value,
    state.value.collapsedGroupIds,
  )
})

const cellValue = computed(() => {
  if (props.item.kind === 'valueLabel') {
    return props.item.label ?? ''
  }

  if (isPromoted.value && props.item.rowFieldIndex !== undefined) {
    return props.groupPath[props.item.rowFieldIndex] ?? ''
  }

  if (props.item.kind === 'empty') {
    return ''
  }

  if (props.item.kind === 'grandTotal') {
    return 'Grand Total'
  }

  const value = get(props.item.ref, props.item.row?.field as ObjectKey<T>)

  return value
})

const formattedCellValue = computed(() => {
  const dataType = ['empty', 'grandTotal', 'valueLabel'].includes(props.item.kind ?? '')
    ? undefined
    : props.item.row?.dataType
  const value = formatValue(cellValue.value, props.item.ref, {
    dataType,
    format: props.item.row?.format,
    localeIso: currentLocaleCode.value,
    source: { type: 'component', name: 'PivotRowItemCell' },
  })

  if (props.item.kind === 'subtotal' && !isPromoted.value) {
    return `${value} Total`
  }

  return value
})

const showCellContent = computed(() => {
  return !isHidden.value && (isCollapsible.value || cellValue.value !== '')
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
      v-if="isCollapsible && !isHidden"
      :group-id="collapseGroupId"
    />

    <span
      v-if="showCellContent && formattedCellValue !== ''"
      class="min-w-0 truncate"
    >
      {{ formattedCellValue }}
    </span>
  </div>
</template>

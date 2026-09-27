<script setup lang="ts" generic="T extends IItem = IItem">
// Types
import type { IPivotValueItemCell } from './types/pivot-value-item-cell.type'
import type { IPivotValueColumnItem } from './types/pivot-value-column-item.type'
import type { IPivotDataItem } from './types/pivot-data-item.type'

// Store
import { usePivotStore } from './stores/pivot.store'

type IProps = {
  item: IPivotValueItemCell<T>
  column: IPivotValueColumnItem<T>
  row: IPivotDataItem<T>
}

const props = defineProps<IProps>()

// This component renders once per visible value cell, so shared state (formatter, locale, ui classes) comes
// from the store instead of per-instance composables and computeds
const {
  rowClickable,
  cellClickable,
  emits,
  formatNumber,
  currentLocaleCode,
  valueItemCellUiClass,
  valueItemCellUiStyle,
} = usePivotStore<T>()

const formattedValue = computed(() => {
  if (!props.item.hasValue || !Number.isFinite(props.item.aggregated)) {
    return ''
  }

  const format = props.item.value.format

  if (format) {
    // Aggregates have no single source row; formatValue falls back to `{}`.
    return formatValue(props.item.aggregated, undefined, {
      dataType: props.item.value.dataType,
      format,
      localeIso: currentLocaleCode.value,
      source: { type: 'component', name: 'PivotValueItemCell' },
    })
  }

  return formatNumber(props.item.aggregated, { localeIso: currentLocaleCode.value })
})

const accessibleLabel = computed(() => {
  return [props.row.label, props.column.label, formattedValue.value]
    .filter(Boolean)
    .join(', ')
})

function handleCellClick(ev: MouseEvent | KeyboardEvent) {
  if (cellClickable.value) {
    emits.value.cellClick({
      ev,
      row: props.row,
      cell: props.item,
      column: props.column,
    })

    return
  }

  if (rowClickable.value) {
    emits.value.rowClick({ ev, row: props.row })
  }
}

function handleCellKeydown(ev: KeyboardEvent) {
  if (ev.target !== ev.currentTarget) {
    return
  }

  handleCellClick(ev)
}
</script>

<template>
  <div
    class="pivot-value-item-cell"
    :class="[valueItemCellUiClass, {
      'is-total': item.kind === 'subtotal',
      'is-grand-total': item.kind === 'grandTotal',
      'is-clickable': cellClickable || rowClickable,
    }]"
    :style="[valueItemCellUiStyle, { width: column.width ?? item.value.widthResolved }]"
    :data-pivot-value-column="item.columnId"
    :role="cellClickable || rowClickable ? 'button' : undefined"
    :tabindex="cellClickable || rowClickable ? 0 : undefined"
    :aria-label="cellClickable || rowClickable ? accessibleLabel : undefined"
    @click="handleCellClick"
    @keydown.enter.space.prevent="handleCellKeydown"
  >
    <span
      v-if="formattedValue !== ''"
      class="truncate"
    >
      {{ formattedValue }}
    </span>
  </div>
</template>

<script setup lang="ts" generic="T extends IItem = IItem">
// Types
import type { IPivotValueItemCell } from './types/pivot-value-item-cell.type'
import type { IPivotValueColumnItem } from './types/pivot-value-column-item.type'
import type { IPivotDataItem } from './types/pivot-data-item.type'

// Store
import { usePivotStore } from './stores/pivot.store'

// Constants
import { PIVOT_DEFAULT_PROPS } from './constants/pivot-default-props.constant'

type IProps = {
  item: IPivotValueItemCell<T>
  column: IPivotValueColumnItem<T>
  row: IPivotDataItem<T>
}

const props = defineProps<IProps>()

const { ui, rowClickable, cellClickable, emits } = usePivotStore<T>()
const { currentLocaleCode } = useLocale()
const { formatNumber } = useNumber()

const isClickable = computed(() => cellClickable.value || rowClickable.value)

const valueItemCellClass = computed(() => {
  return [
    ui.value?.valueItemCellClass?.({
      defaults: PIVOT_DEFAULT_PROPS.ui.valueItemCellClass(),
    }),
    {
      'is-total': props.item.kind === 'subtotal',
      'is-grand-total': props.item.kind === 'grandTotal',
    },
  ]
})

const valueItemCellStyle = computed(() => {
  const valueItemCellStyle = ui.value?.valueItemCellStyle?.()
  const width = props.column.width ?? props.item.value.widthResolved

  return Object.assign({}, valueItemCellStyle, { width })
})

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

  return formatNumber(props.item.aggregated)
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
    :class="[valueItemCellClass, { 'is-clickable': isClickable }]"
    :style="valueItemCellStyle"
    :data-pivot-value-column="item.columnId"
    :role="isClickable ? 'button' : undefined"
    :tabindex="isClickable ? 0 : undefined"
    :aria-label="isClickable ? accessibleLabel : undefined"
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

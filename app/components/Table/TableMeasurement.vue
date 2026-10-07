<script setup lang="ts" vapor>
import type { ITableProps } from './types/table-props.type'
import type { TableMeasurementRequest } from './composables/useRenderTemporaryTableCell'
import { TABLE_DEFAULT_PROPS } from './constants/table-default-props.constant'
import Checkbox from '../Checkbox/Checkbox.vue'

const props = defineProps<{
  request: TableMeasurementRequest
  customData?: Record<string, unknown>
}>()
const emit = defineEmits<{ ready: [element: HTMLElement] }>()
const element = useTemplateRef<HTMLElement>('element')
const { currentLocaleCode } = useLocale()
const column = computed(() => props.request.col)
const ui = computed<ITableProps['ui']>(() => props.request.ui ?? getComponentProps('table').ui?.())
const isHeader = computed(() => props.request.kind === 'header')
const value = computed(() => isHeader.value
  ? undefined
  : column.value.valueGetter(props.request.row))
const formattedValue = computed(() => formatValue(value.value, props.request.row, {
  format: column.value.format,
  dataType: column.value.dataType,
  comparator: column.value.comparator,
  localeIso: currentLocaleCode.value,
  source: { type: 'component', name: 'TableRow' },
}))

const cellProps = computed(() => ({
  row: props.request.row,
  column: column.value,
  value: value.value,
  index: props.request.index ?? 0,
  customData: props.customData,
}))

const cellClass = computed(() => {
  const col = column.value
  if (isHeader.value) {
    return [col.headerClass, ui.value?.headerCellClass?.({
      column: col,
      defaults: TABLE_DEFAULT_PROPS.ui.headerCellClass(),
    })]
  }

  return [
    typeof col.cellClass === 'function' ? col.cellClass(props.request.row) : col.cellClass,
    ui.value?.cellClass?.({
      ...cellProps.value,
      defaults: TABLE_DEFAULT_PROPS.ui.cellClass(),
    }),
  ]
})

const cellStyle = computed(() => {
  const col = column.value
  if (isHeader.value) {
    return { ...ui.value?.headerCellStyle?.({ column: col }), ...col.headerStyle }
  }

  return {
    ...(typeof col.cellStyle === 'function' ? col.cellStyle(props.request.row) : col.cellStyle),
    ...ui.value?.cellStyle?.(cellProps.value),
  }
})

const innerClass = computed(() => isHeader.value
  ? ui.value?.headerCellInnerClass?.({
      column: column.value,
      defaults: TABLE_DEFAULT_PROPS.ui.headerCellInnerClass(),
    })
  : ui.value?.cellInnerClass?.({
      ...cellProps.value,
      defaults: TABLE_DEFAULT_PROPS.ui.cellInnerClass(),
    }))
const innerStyle = computed(() => isHeader.value
  ? ui.value?.headerCellInnerStyle?.({ column: column.value })
  : ui.value?.cellInnerStyle?.(cellProps.value))

// Preserve the two-line header sizing policy used by autofit.
const headerLabel = computed(() => {
  const label = column.value._label
  const words = label.split(' ')
  if (label.length <= 16 || words.length <= 1) {
    return label
  }

  const middle = Math.floor(words.length / 2)
  const first = words.slice(0, middle).join(' ')
  const second = words.slice(middle).join(' ')

  return first.length >= second.length ? first : second
})
const hasFilterButton = computed(() => !column.value.isHelperCol
  && !column.value.nonInteractive
  && (column.value.filterable || column.value.sortable))
const displayComponent = computed(() => column.value.displayComponent)
const displayProps = computed(() => typeof displayComponent.value?.props === 'function'
  ? displayComponent.value.props(cellProps.value)
  : displayComponent.value?.props)

onMounted(() => {
  if (element.value) {
    emit('ready', element.value)
  }
})
</script>

<template>
  <div
    ref="element"
    data-table-measurement
    aria-hidden="true"
    inert
    class="table-measurement"
    :class="[cellClass, { 'table-measurement--header': isHeader }]"
    :style="cellStyle"
  >
    <template v-if="isHeader">
      <span
        :class="innerClass"
        :style="innerStyle"
      >{{ headerLabel }}</span>
      <div
        v-if="hasFilterButton"
        class="table-measurement__filter"
      />
    </template>
    <slot
      v-else
      v-bind="cellProps"
    >
      <Component
        :is="displayComponent.component"
        v-if="displayComponent"
        v-bind="displayProps"
      />
      <Checkbox
        v-else-if="column.dataType === 'boolean'"
        :model-value="value"
        :label="formattedValue"
        size="sm"
        readonly
        no-hover-effect
        :ui="{ labelClass: ({ defaults }) => `${defaults.all} font-rem-13` }"
      />
      <span
        v-else
        :class="innerClass"
        :style="innerStyle"
      >{{ formattedValue }}</span>
    </slot>
  </div>
</template>

<style scoped>
.table-measurement {
  --colWidth: auto;

  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  width: max-content !important;
  max-width: none !important;
  visibility: hidden;
  pointer-events: none;
}

.table-measurement--header {
  gap: 8px;
}

.table-measurement__filter {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
}
</style>

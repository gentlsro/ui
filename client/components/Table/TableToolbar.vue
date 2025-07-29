<script setup lang="ts">
// Types
import type { ITableProps } from './types/table-props.type'
import type { TableFeature } from './types/table-feature.type'

// Store
import { useTableStore } from './stores/table2.store'

type IProps = Pick<ITableProps, 'features' | 'ui'>

const props = defineProps<IProps>()

// Store
const {
  internalColumns,
  selection,
  selectionConfig,
  isCardView,
} = useTableStore()

// Layout
const featuresEnabledByName = computed<Record<TableFeature, boolean>>(() => {
  return props.features?.reduce((agg, feature) => {
    agg[feature] = true

    return agg
  }, {} as Record<TableFeature, boolean>) ?? {} as Record<TableFeature, boolean>
})

const selectionCount = computed(() => {
  return Array.isArray(selection.value)
    ? selection.value.length
    : (selection.value ? 1 : 0)
})

// Sorting
const tableSorting = computed(() => {
  return internalColumns.value
    .filter(col => col.sort)
    .map(col => ({
      label: col._label,
      field: col.field,
      direction: col.sort,
      sortOrder: col.sortOrder,
    }))
    .toSorted((a, b) => (a!.sortOrder || 0) - (b!.sortOrder || 0))
    .map(col =>
      `<span class="max-w-40 truncate inline-block">
        (${col.direction === 'asc' ? '&#8593;' : '&#8595;'}) ${col.label}
      </span>`,
    )
    .join(', ')
})

function handleClearSorting() {
  internalColumns.value = internalColumns.value.map(col => {
    col.sort = undefined
    col.sortOrder = undefined

    return col
  })
}
</script>

<template>
  <div
    class="table-toolbar"
    :class="ui?.toolbarClass"
    :style="ui?.toolbarStyle"
  >
    <slot name="prepend" />

    <div
      flex="~ items-center gap-2 grow"
      overflow="auto"
    >
      <!-- Selection -->
      <slot
        name="selection"
        :selection
      >
        <Btn
          v-if="selectionConfig?.enabled"
          size="sm"
          icon="i-fluent:select-all-on-20-regular !w-5 !h-5"
          m="l--1"
          no-uppercase
          :label="`${$t('general.selected')}: ${selectionCount}`"
          :ui="{ labelClass: 'hidden md:block' }"
        >
          <div class="i-flowbite:chevron-right-outline rotate-90 h-4 w-4" />

          <slot
            name="selection-menu"
            :selection
          />
        </Btn>
      </slot>

      <!-- Sorting -->
      <slot name="sorting">
        <HorizontalScroller
          v-if="featuresEnabledByName.sorting && tableSorting.length"
          :ui="{ contentClass: 'items-center gap-1' }"
          grow
        >
          <span class="table-toolbar__sorting-label">
            {{ $t('table.sortBy') }}:
          </span>

          <div
            flex="~ items-center gap-1"
            text="xs"
            data-cy="sort-active-fields"
            v-html="tableSorting"
          />

          <Btn
            preset="TRASH"
            size="xs"
            :label="$t('general.sorting.clear')"
            :ui="{ labelClass: 'hidden md:block' }"
            data-cy="clear-sorting"
            @click="handleClearSorting"
          />
        </HorizontalScroller>
      </slot>
    </div>

    <div flex="~ items-center gap-2">
      <!-- Auto-fit -->
      <slot
        v-if="!isCardView"
        name="autofit"
      >
        <TableAutofitBtn
          v-if="featuresEnabledByName.autofit"
          order="10"
        />
      </slot>

      <!-- Columns -->
      <slot name="columns">
        <TableColumnSelectionBtn
          v-if="featuresEnabledByName.columnSelection"
          order="20"
        />
      </slot>

      <!-- Layout -->
      <slot name="layout">
        <TableLayoutSelector
          v-if="featuresEnabledByName.layouts"
          order="30"
        />
      </slot>

      <slot name="append" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.table-toolbar {
  @apply flex items-center gap-2 p-t-1 p-b-2px p-x-2;

  &__sorting {
    @apply flex gap-1 items-center;

    &-label {
      @apply font-semibold text-caption text-xs;
    }
  }
}
</style>

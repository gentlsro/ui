<script setup lang="ts">
// Types
import type { ITableProps } from './types/table-props.type'
import type { TableFeature } from './types/table-feature.type'

// Store
import { useTableStore } from './stores/table.store'

// Functions
import { tableSetColumnSort } from './functions/table-set-column-sort'

// Constants
import { TABLE_DEFAULT_PROPS } from './constants/table-default-props.constant'

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

const toolbarClass = computed(() => {
  return props.ui?.toolbarClass?.({
    defaults: TABLE_DEFAULT_PROPS.ui.toolbarClass(),
  })
})

const toolbarStyle = computed(() => {
  return props.ui?.toolbarStyle?.()
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
})

function handleRemoveSort(field: string) {
  const column = internalColumns.value.find(col => col.field === field)

  if (column) {
    tableSetColumnSort(internalColumns.value, column)
  }
}
</script>

<template>
  <div
    class="table-toolbar"
    :class="toolbarClass"
    :style="toolbarStyle"
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
          icon="i-lucide:list-checks"
          class="table-toolbar-btn"
          no-uppercase
          :label="`${$t('general.selected')}: ${selectionCount}`"
          :ui="{ labelClass: ({ defaults }) => `${defaults.all} hidden md:flex` }"
        >
          <div class="i-lucide:chevron-down w-3.5 h-3.5 opacity-60 shrink-0" />

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
          :ui="{ contentClass: ({ defaults }) => `${defaults.all} items-center gap-1 p-y-1.5 p-r-2` }"
          grow
        >
          <span class="table-toolbar__sorting-label">
            {{ $t('general.sorting.self') }}
          </span>

          <div
            class="table-toolbar__sorting"
            data-cy="sort-active-fields"
          >
            <!-- Removable like tags: hover shows the remove badge, click removes the sort -->
            <button
              v-for="sort in tableSorting"
              :key="sort.field"
              type="button"
              class="table-toolbar__sorting-chip"
              :title="$t('general.remove')"
              data-cy="remove-sorting"
              @click="handleRemoveSort(sort.field)"
            >
              <span
                class="w-3.5 h-3.5 shrink-0"
                :class="sort.direction === 'asc' ? 'i-lucide:arrow-up' : 'i-lucide:arrow-down'"
              />

              <span class="max-w-40 truncate">
                {{ sort.label }}
              </span>

              <span class="table-toolbar__sorting-remove">
                <span class="i-lucide:x w-3 h-3" />
              </span>
            </button>
          </div>
        </HorizontalScroller>
      </slot>
    </div>

    <div flex="~ items-center @2xl:gap-2">
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
@use '#layers/ui/app/css/hover-on-desktop-mixin.scss' as hover;

.table-toolbar {
  @apply flex items-center gap-2 p-b-1 p-x-3;

  // Labels never wrap; the sorting chips scroll instead
  :deep(.table-toolbar-btn) {
    @apply color-true-gray-600 dark:color-true-gray-300 rounded-lg font-medium shrink-0 whitespace-nowrap;

    &:hover {
      @apply bg-true-gray-100 dark:bg-true-gray-800 color-true-gray-900 dark:color-white;
    }
  }

  &__sorting {
    @apply flex gap-1 items-center;

    &-label {
      @apply font-medium text-xs color-true-gray-500 dark:color-true-gray-400 p-r-1 shrink-0;
    }

    &-chip {
      @apply relative flex items-center gap-1 h-6 p-x-2 rounded-md text-xs font-medium cursor-pointer
        bg-primary/10 color-primary dark:bg-primary/40 dark:color-white;

      @include hover.on-desktop {
        @apply outline-1 outline-offset-1 outline-solid outline-negative z-1;

        .table-toolbar__sorting-remove {
          @apply flex;
        }
      }
    }

    &-remove {
      @apply absolute hidden flex-center top--1.25 right--2 w-4 h-4 rounded-1.5
        bg-negative color-white;
    }
  }
}
</style>

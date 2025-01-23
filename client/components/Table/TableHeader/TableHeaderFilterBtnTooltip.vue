<script setup lang="ts">
// Models
import type { TableColumn } from '../models/table-column.model'

// Store
import { useTableStore } from '../stores/table.store'

type IProps = {
  column: TableColumn
}

defineProps<IProps>()

// Store
const { emptyValue } = storeToRefs(useTableStore())
</script>

<template>
  <Tooltip :offset="8">
    <div
      flex="~ gap-2 col"
      w="70"
      p="t-2 b-1"
    >
      <!-- Column label -->
      <div flex="~ col">
        <span
          text="caption"
          font="semibold"
        >
          {{ column.label }}
        </span>

        <Separator />
      </div>

      <!-- Sorting -->
      <div
        v-if="column.sort"
        class="wrapper items-center"
      >
        <div :class="[column.sort === 'asc' ? 'i-ph:sort-descending-bold' : 'i-ph:sort-ascending-bold']" />
        <span text="xs">
          {{ $t(`sorting.${column.sort}`) }}
        </span>
      </div>

      <!-- Filters -->
      <template v-if="!!column.filterDbQuery.length">
        <div
          v-for="filter in column.filters"
          :key="filter.id"
          class="wrapper flex-col"
        >
          <!-- Comparator -->
          <span text="caption xs">
            {{ $t(`comparator.${filter.comparator.replaceAll('.', '|')}`) }}
          </span>

          <!-- Filter value -->
          <ValueFormatter
            :value="filter.value"
            :data-type="column.dataType"
            :empty-value
            :format="column.format"
            :empty-value-string="$t('general.empty')"
            text="sm"
          />

          <span
            v-if="filter.nonInteractive"
            text="xs caption right"
            border="t-1 ca"
          >
            {{ $t('table.nonInteractiveFilter') }}
          </span>
        </div>
      </template>
    </div>
  </Tooltip>
</template>

<style scoped lang="scss">
.wrapper {
  @apply flex gap-1 p-x-2 p-y-1 border-ca border-dashed rounded-custom;
}
</style>

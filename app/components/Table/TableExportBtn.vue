<script setup lang="ts">
// Types
import type { ITableExport } from './types/table-export.type'

// Store
import { useTableStore } from './stores/table.store'

// Constants
import { tableExportData } from './functions/table-export-data'

// Store
const {
  rows,
  visibleColumns,
  isExporting,
  exportData,
} = useTableStore()

async function handleExportData(exportDefinition: ITableExport) {
  isExporting.value = true

  try {
    await tableExportData({
      rows: rows.value,
      columns: visibleColumns.value.filter(col => !col.isHelperCol),
      exportDefinition,
    })
  } finally {
    isExporting.value = false
  }
}
</script>

<template>
  <Btn
    icon="i-lucide:download"
    class="table-export-btn"
    p="!x-2"
    no-uppercase
    no-dim
    size="sm"
    :label="$t('table.export', 1)"
    :loading="isExporting"
  >
    <div class="i-lucide:chevron-down w-3.5 h-3.5 opacity-60" />

    <Menu
      placement="bottom-end"
      :offset="4"
      min-w="40"
    >
      <Btn
        v-for="exportDefinition in exportData"
        :key="exportDefinition.id"
        :label="exportDefinition.label"
        :icon="exportDefinition.icon"
        :loading="isExporting"
        align="left"
        no-uppercase
        no-bold
        class="rounded-md"
        @click="handleExportData(exportDefinition)"
      />
    </Menu>
  </Btn>
</template>

<style scoped lang="scss">
.table-export-btn {
  @apply rounded-lg font-medium color-true-gray-600 dark:color-true-gray-300;

  &:hover,
  &.is-menu-active {
    @apply bg-true-gray-100 dark:bg-true-gray-800 color-true-gray-900 dark:color-white;
  }
}
</style>

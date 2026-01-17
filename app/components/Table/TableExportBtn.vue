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

  await tableExportData({
    rows: rows.value,
    columns: visibleColumns.value.filter(col => !col.isHelperCol),
    exportDefinition,
  })

  isExporting.value = false
}
</script>

<template>
  <Btn
    icon="i-material-symbols:download"
    color="ca"
    no-uppercase
    bg="!white !dark:black"
    size="sm"
    :label="$t('table.export', 1)"
    outlined
    :loading="isExporting"
  >
    <div class="i-flowbite:chevron-right-outline rotate-90" />

    <Menu>
      <Btn
        v-for="exportDefinition in exportData"
        :key="exportDefinition.id"
        :label="exportDefinition.label"
        :icon="exportDefinition.icon"
        :loading="isExporting"
        align="left"
        no-uppercase
        @click="handleExportData(exportDefinition)"
      />
    </Menu>
  </Btn>
</template>

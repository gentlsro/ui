<script setup lang="ts">
// Functions
import { ICON_BY_FILE_EXTENSION } from '../Inputs/FileInput/constants/icon-by-file-extension'

// Store
import { useTableStore } from './stores/table.store'

// Constants
import { tableExportData } from './functions/table-export-data'

// Store
const {
  rows,
  visibleColumns,
  isExporting,
  modifiers,
} = storeToRefs(useTableStore())

// Utils
const { exportData = tableExportData } = modifiers.value ?? {}

async function handleExportData(format?: 'xlsx' | 'csv' | 'json') {
  isExporting.value = true

  await exportData({
    rows: rows.value,
    columns: visibleColumns.value.filter(col => !col.isHelperCol),
    format,
  })

  isExporting.value = false
}
</script>

<template>
  <Btn
    icon="i-material-symbols:download"
    color="ca"
    no-uppercase
    size="sm"
    :label="$t('table.export', 1)"
    outlined
    :loading="isExporting"
  >
    <div class="i-flowbite:chevron-right-outline rotate-90" />

    <Menu>
      <!-- XLSX -->
      <Btn
        :label="$t('mimetype.excel')"
        :icon="ICON_BY_FILE_EXTENSION.xlsx"
        :loading="isExporting"
        align="left"
        no-uppercase
        @click="handleExportData('xlsx')"
      />

      <!-- CSV -->
      <Btn
        :label="$t('mimetype.csv')"
        :icon="ICON_BY_FILE_EXTENSION.csv"
        :loading="isExporting"
        align="left"
        no-uppercase
        @click="handleExportData('csv')"
      />

      <!-- JSON -->
      <Btn
        :label="$t('mimetype.json')"
        :icon="ICON_BY_FILE_EXTENSION.json"
        :loading="isExporting"
        align="left"
        no-uppercase
        @click="handleExportData('json')"
      />
    </Menu>
  </Btn>
</template>

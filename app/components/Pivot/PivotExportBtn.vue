<script setup lang="ts" generic="T extends IItem = IItem">
import type { PivotExportFormat } from './types/pivot-export.type'
import { TABLE_EXPORTS_DEFAULT } from '../Table/constants/table-exports-default.constant'
import { usePivotStore } from './stores/pivot.store'
import { buildPivotCurrentViewExport } from './functions/pivot-build-current-view-export'
import { exportPivotData } from './functions/pivot-export-data'
import { PIVOT_MEASURE_ROW_FIELD } from './constants/pivot-measure-row.constant'

const {
  sourceData,
  displayRowFields,
  rows,
  visibleData,
  visibleValueColumns,
  visibleValueHeaderRows,
  promotedRowLabelLevelsById,
  state,
} = usePivotStore<T>()

const { currentLocaleCode } = useLocale()

const raw = ref(false)
const isExporting = ref(false)

async function handleExport(format: PivotExportFormat) {
  isExporting.value = true

  try {
    const currentView = raw.value
      ? undefined
      : buildPivotCurrentViewExport({
          displayRowFields: displayRowFields.value,
          rows: rows.value,
          visibleData: visibleData.value,
          visibleValueColumns: visibleValueColumns.value,
          visibleValueHeaderRows: visibleValueHeaderRows.value,
          promotedRowLabelLevelsById: promotedRowLabelLevelsById.value,
          collapsedGroupIds: state.value.collapsedGroupIds,
          localeIso: currentLocaleCode.value,
          formatCellValue: ({ value, row, dataType, format, localeIso }) => {
            return formatValue(value, row, {
              dataType,
              format,
              localeIso,
              source: { type: 'component', name: 'PivotExportBtn' },
            })
          },
        })

    currentView?.rowHeaders.forEach(header => {
      if (header.field === PIVOT_MEASURE_ROW_FIELD) {
        header.label = $t('pivot.measureField')
      }
    })

    await exportPivotData({
      fileName: `data-${$date(undefined, { utc: false }).format('YYYY-MM-DD HH:mm:ss')}`,
      format,
      raw: raw.value,
      rawData: sourceData.value,
      currentView,
    })
  } finally {
    isExporting.value = false
  }
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
      <Toggle
        v-model="raw"
        :label="$t('pivot.rawData')"
        size="sm"
      />

      <Separator />

      <Btn
        v-for="exportDefinition in TABLE_EXPORTS_DEFAULT"
        :key="exportDefinition.id"
        :label="exportDefinition.label"
        :icon="exportDefinition.icon"
        :loading="isExporting"
        align="left"
        no-uppercase
        @click="handleExport(exportDefinition.id as PivotExportFormat)"
      />
    </Menu>
  </Btn>
</template>

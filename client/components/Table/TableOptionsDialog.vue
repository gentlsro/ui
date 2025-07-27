<script setup lang="ts">
// Types
import type { IUIState } from '../../types/ui-state.type'

// Store
import { useTableStore } from './stores/table.store'

type IProps = {
  modelValue?: boolean
}

defineProps<IProps>()

// Layout
const model = defineModel<boolean>({ default: false })

// Store
const { uiState } = storeToRefs(useUIStore())
const { modifiers } = storeToRefs(useTableStore())

function setFitColumns(mode: NonNullable<IUIState['table']>['fit'], unset?: boolean) {
  set(uiState.value, 'table.fit', unset ? null : mode)
}

function setAutoSaveSchema(value: boolean) {
  set(uiState.value, 'table.autoSaveSchema', !!value)

  if (modifiers.value) {
    modifiers.value.autoSaveSchema = !!value
    console.log('🚀 ~ setAutoSaveSchema ~ modifiers.value.autoSaveSchema:', modifiers.value.autoSaveSchema)
  }
}
</script>

<template>
  <Dialog
    v-model="model"
    h="!auto"
    w="200"
    manual
    :title="$t('table.options')"
    :ui="{ contentClass: 'p-3' }"
  >
    <!-- Auto-save table layout -->
    <Toggle
      :model-value="!!modifiers?.autoSaveSchema"
      :label="$t('table.autoSaveLayout')"
      @update:model-value="setAutoSaveSchema"
    />

    <span class="hint">
      {{ $t('table.autoSaveLayoutExplain') }}
    </span>

    <Separator m="y-2" />

    <!-- Auto-fit columns -->
    <Checkbox
      :model-value="uiState.table?.fit === 'fit'"
      :label="$t('table.autoFitColumns')"
      @update:model-value="setFitColumns('fit', uiState.table?.fit === 'fit')"
    />

    <span class="hint">
      {{ $t('table.autoFitColumnsExplain') }}
    </span>

    <Separator m="y-2" />

    <!-- Auto-fit columns with header -->
    <Checkbox
      :model-value="uiState.table?.fit === 'fit-with-header'"
      :label="$t('table.autoFitColumnsWithHeader')"
      @update:model-value="setFitColumns('fit-with-header', uiState.table?.fit === 'fit-with-header')"
    />

    <span class="hint">
      {{ $t('table.autoFitColumnsWithHeaderExplain') }}
    </span>

    <Separator m="y-2" />

    <!-- Auto-justify columns -->
    <Checkbox
      :model-value="uiState.table?.fit === 'justify'"
      :label="$t('table.autoJustifyColumns')"
      @update:model-value="setFitColumns('justify', uiState.table?.fit === 'justify')"
    />

    <span class="hint">
      {{ $t('table.autoJustifyColumnsExplain') }}
    </span>

    <span class="hint">
      {{ $t('table.autoJustifyColumnsExplain2') }}
    </span>

    <Separator m="y-2" />

    <!-- Auto-stretch columns -->
    <Checkbox
      :model-value="uiState.table?.fit === 'stretch'"
      :label="$t('table.autoStretchColumns')"
      @update:model-value="setFitColumns('stretch', uiState.table?.fit === 'stretch')"
    />

    <span class="hint">
      {{ $t('table.autoStretchColumnsExplain') }}
    </span>
  </Dialog>
</template>

<style scoped lang="scss">
.hint {
  @apply text-caption font-rem-12 rounded-custom p-2 bg-gray-50 dark:bg-dark;
}
</style>

<script setup lang="ts">
// Types
import type { ITableFilterItem } from '../../types/table-filter-item.type'

// Models
import type { TableColumn } from '../../models/table-column.model'

type IProps = {
  column: TableColumn
  item: ITableFilterItem
  modifyFnc?: (filter: ITableFilterItem, debounceMs?: number) => void
}

const props = defineProps<IProps>()
defineEmits<{ (e: 'remove:item'): void }>()

// Layout
const valueInputEl = useTemplateRef('valueInputEl')

const debounceFilterTriggerMs = computed(() => {
  const isRelevantComparator = props.column.filterComponent?.comparators
    .includes(props.item.comparator)

  return isRelevantComparator
    ? props.column.filterComponent?.debounceFilterTriggerMs
    : undefined
})

defineExpose({ focus: () => valueInputEl.value?.focus() })
</script>

<template>
  <div class="filtering-item">
    <div class="filtering-item__comparator">
      <TableHeaderColumnFilteringComparator
        :column
        :item
        editable
        grow
        @update:model-value="modifyFnc?.(item)"
      />

      <!-- Remove -->
      <Btn
        preset="TRASH"
        size="sm"
        tabindex="-1"
        @click="$emit('remove:item')"
      />
    </div>

    <TableHeaderColumnFilteringValue
      ref="valueInputEl"
      :column
      :item
      editable
      :zod="{
        key: 'item.value',
        options: { scope: 'qb' },
      }"
      @update:model-value="modifyFnc?.(item, debounceFilterTriggerMs)"
    />
  </div>
</template>

<style scoped lang="scss">
.filtering-item {
  @apply flex flex-col gap-1 p-1 border-ca bg-ca border-dotted rounded-custom;

  &__comparator {
    @apply flex gap-1;
  }
}
</style>

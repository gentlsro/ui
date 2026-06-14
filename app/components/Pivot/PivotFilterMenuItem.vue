<script setup lang="ts" generic="T extends IItem = IItem">
// Types
import type { ITableFilterItem } from '../Table/types/table-filter-item.type'

// Models
import type { TableColumn } from '../Table/models/table-column.model'

type IProps = {
  column: TableColumn<T>
  item: ITableFilterItem<T>
  modifyFnc?: (filter: ITableFilterItem<T>, debounceMs?: number) => void
}

const props = defineProps<IProps>()
defineEmits<{ (e: 'remove:item'): void }>()

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
  <div class="pivot-filter-menu-item">
    <div class="pivot-filter-menu-item__comparator">
      <PivotFilterMenuComparator
        :column
        :item
        editable
        grow
        @update:model-value="modifyFnc?.(item)"
      />

      <Btn
        preset="TRASH"
        size="sm"
        tabindex="-1"
        @click="$emit('remove:item')"
      />
    </div>

    <PivotFilterMenuValue
      ref="valueInputEl"
      :column
      :item
      editable
      @update:model-value="modifyFnc?.(item, debounceFilterTriggerMs)"
    />
  </div>
</template>

<style scoped lang="scss">
.pivot-filter-menu-item {
  @apply flex flex-col gap-1 p-1 border-ca bg-ca border-dotted rounded-custom;

  &__comparator {
    @apply flex gap-1;
  }
}
</style>

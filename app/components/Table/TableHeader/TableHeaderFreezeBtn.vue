<script setup lang="ts">
// Models
import type { TableColumn } from '../models/table-column.model'

// Store
import { useTableStore } from '../stores/table.store'

type IProps = {
  column: TableColumn
}

const props = defineProps<IProps>()

// Store
const { internalColumns } = useTableStore()

// Layout
const btnProps = computed(() => {
  return props.column.frozen
    ? { class: 'is-active', icon: 'i-lucide:lock' }
    : { icon: 'i-lucide:lock-open' }
})

function handleFreezeColumn() {
  props.column.freeze(internalColumns.value)
}
</script>

<template>
  <Btn
    v-bind="btnProps"
    class="column-lock"
    size="xs"
    no-dim
    @click="handleFreezeColumn"
  />
</template>

<style scoped lang="scss">
.column-lock {
  @apply rounded-md color-true-gray-500 dark:color-true-gray-400 bg-white dark:bg-true-gray-900;

  display: none !important;
  position: absolute !important;
  right: calc(100% + 2px);

  &:hover {
    @apply bg-true-gray-200 dark:bg-true-gray-700 color-true-gray-800 dark:color-true-gray-100;
  }

  &.is-active {
    @apply color-primary bg-primary/10 dark:color-true-gray-100 dark:bg-primary/45;

    display: flex !important;
  }
}

.th:hover > .th__actions > .column-lock {
  display: flex !important;
}
</style>

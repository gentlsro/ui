<script setup lang="ts">
// Models
import type { TableColumn } from '../models/table-column.model'

// Store
import { useTableStore } from '../stores/table2.store'

type IProps = {
  column: TableColumn
}

const props = defineProps<IProps>()

// Store
const { internalColumns } = useTableStore()

// Layout
const btnProps = computed(() => {
  return props.column.frozen
    ? { class: 'bg-white dark:bg-darker color-primary is-active', icon: 'i-basil:lock-solid' }
    : { class: 'color-ca', icon: 'i-basil:unlock-outline' }
})

function handleFreezeColumn() {
  props.column.freeze(internalColumns.value)
}
</script>

<template>
  <Btn
    v-bind="btnProps"
    class="column-lock"
    size="sm"
    @click="handleFreezeColumn"
  />
</template>

<style scoped lang="scss">
.column-lock {
  @apply backdrop-blur-sm;

  display: none !important;
  position: absolute !important;

  &.is-active {
    display: flex !important;
  }
}

.th:hover > .th__actions > .column-lock {
  display: flex !important;
}
</style>

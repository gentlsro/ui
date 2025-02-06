<script setup lang="ts">
import type { ITableProps } from './types/table-props.type'

// Store
import { useTableStore } from './stores/table.store'

type IProps = Pick<ITableProps, 'totals' | 'ui'>

const props = defineProps<IProps>()

// Store
const { totalsEl, totalsX, visibleColumns } = storeToRefs(useTableStore())

// Layout
const totalsByField = computed(() => {
  return props.totals?.reduce((agg, total) => {
    agg[total.field] = total

    return agg
  }, {} as Record<string, any>)
})
</script>

<template>
  <HorizontalScroller
    ref="totalsEl"
    v-model:scroll-position="totalsX"
    class="table-totals"
    :ui="{ contentClass: 'gap-0' }"
  >
    <TableTotalsCell
      v-for="col in visibleColumns"
      :key="col.field"
      :column="col"
      :ui
      :total="totalsByField?.[col.field]"
    />
  </HorizontalScroller>
</template>

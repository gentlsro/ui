<script setup lang="ts">
import type { ITableProps } from './types/table-props.type'

// Store
import { useTableStore } from './stores/table.store'

type IProps = Pick<ITableProps, 'totals' | 'ui'>

const props = defineProps<IProps>()

// Utils
const { handleRequest } = useRequest()

// Store
const tableStore = useTableStore()
const {
  totals,
  rows,
  totalsEl,
  totalsX,
  visibleColumns,
} = storeToRefs(tableStore)

// Layout
const totalsByField = computed(() => {
  return totals.value?.reduce((agg, total) => {
    agg[total.field] = total

    return agg
  }, {} as Record<string, any>)
})

// Data fetching
watch(rows, getTotals)

async function getTotals() {
  if (typeof props.totals === 'function') {
    const tablePayload = tableStore.getFetchPayload()
    const totalsFnc = props.totals

    const res = await handleRequest(() => {
      return totalsFnc({
        tablePayload,
        rows: rows.value,
        getStore: () => tableStore,
      })
    }, { noResolve: true })

    totals.value = res
  }

  else if (props.totals) {
    totals.value = props.totals
  }
}
</script>

<template>
  <HorizontalScroller
    v-if="totals?.length"
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

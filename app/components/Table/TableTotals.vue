<script setup lang="ts">
// Types
import type { ITableProps } from './types/table-props.type'

// Store
import { useTableStore } from './stores/table.store'

type IProps = Pick<ITableProps, 'totals' | 'ui'> & { hasRowActions?: boolean }

const props = defineProps<IProps>()

// Utils
const { fn } = useFn({
  source: { type: 'component', name: 'TableTotals' },
})

// Store
const tableStore = useTableStore()
const {
  totals,
  rows,
  totalsEl,
  totalsX,
  visibleColumns,
} = tableStore

// Layout
const totalsByField = computed(() => {
  return totals.value?.reduce((agg, total) => {
    agg[total.field] = total

    return agg
  }, {} as Record<string, any>)
})

// Data fetching
watch(
  [rows, () => props.totals],
  getTotals,
  { immediate: true },
)

async function getTotals() {
  if (typeof props.totals === 'function') {
    const tablePayload = tableStore.getFetchPayload()
    const totalsFnc = props.totals

    const res = await fn(() => {
      return totalsFnc({
        tablePayload,
        rows: rows.value,
        getStore: () => tableStore,
      })
    })

    totals.value = res
  }

  else if (props.totals) {
    totals.value = props.totals
  }

  else {
    totals.value = undefined
  }
}
</script>

<template>
  <HorizontalScroller
    v-if="totals?.length"
    ref="totalsEl"
    v-model:scroll-position="totalsX"
    class="table-totals shrink-0"
  >
    <TableTotalsCell
      v-for="col in visibleColumns"
      :key="col.field"
      :column="col"
      :ui
      :total="totalsByField?.[col.field]"
    />
    
    <div v-if="hasRowActions" aria-hidden="true" style="flex: 0 0 var(--table-row-actions-width, 5.25rem)" />
  </HorizontalScroller>
</template>

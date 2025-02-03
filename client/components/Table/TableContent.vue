<script setup lang="ts">
// Types
import type { ITableProps } from './types/table-props.type'

// Store
import { useTableStore } from './stores/table.store'
import { tableEditMoveCell } from './functions/table-edit-move-cell'
import type { IVirtualScrollEvent } from '../VirtualScroller/types/virtual-scroll-event.type'

type IProps = Pick<ITableProps, 'editable' | 'ui' | 'to'>

defineProps<IProps>()

// Constants
const FETCH_MORE_THRESHOLD = 10

// Store
const { activeElement } = storeToRefs(useUIStore())
const tableStore = useTableStore()
const {
  rowKey,
  rowsSplit,
  tableEl,
  virtualScrollEl,
  visibleColumns,
  cellEdit,
  isCardView,
  hasMore,
  isFetchMore,
  paginationConfig,
  isDataLoading,
} = storeToRefs(tableStore)

// Layout
function handleVirtualScroll(ev: IVirtualScrollEvent) {
  const { visibleEndItem } = ev
  const isFetchMore = rowsSplit.value.length - visibleEndItem.index - 1 < FETCH_MORE_THRESHOLD

  if (isFetchMore && hasMore.value && !paginationConfig.value?.enabled && !isDataLoading.value) {
    tableStore.fetchAndSetData({ isFetchMore: true })
  }
}

/**
 * When the cell edit changes, we need to update heights of the rows affected
 */
watch(cellEdit, (cellEdit, oldCellEdit) => {
  nextTick(() => {
    const columnField = cellEdit?.column?.field
    const itemKey = cellEdit?.row?.[rowKey.value]

    const el = tableEl.value
      ?.querySelector(`[data-field="${columnField}"][data-key="${itemKey}"]`) as HTMLElement
    const elRow = el?.closest('.virtual-scroll__row') as HTMLElement
    const elRowIdx = Number(elRow?.dataset.idx ?? 9999)

    const oldColumnField = oldCellEdit?.column?.field
    const oldItemKey = oldCellEdit?.row?.[rowKey.value]
    const oldEl = tableEl.value
      ?.querySelector(`[data-field="${oldColumnField}"][data-key="${oldItemKey}"]`) as HTMLElement
    const oldElRow = oldEl?.closest('.virtual-scroll__row') as HTMLElement
    const oldElRowIdx = Number(oldElRow?.dataset.idx ?? 9999)

    if (elRowIdx === oldElRowIdx) {
      // Do nothing
    } else if (elRowIdx > oldElRowIdx) {
      virtualScrollEl.value?.updateRowHeight(oldElRow)
    } else {
      virtualScrollEl.value?.updateRowHeight(elRow)
    }
  })
})

onKeyStroke(['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'Escape', 'Enter'], ev => {
  const isInsideEditCell = !!activeElement.value?.closest('.active-edit-cell')
  const isCtrlKey = ev.ctrlKey || ev.metaKey

  if (isInsideEditCell && tableEl.value && cellEdit.value) {
    if (ev.key === 'Escape') {
      cellEdit.value = undefined
    } else if (ev.key === 'Enter') {
      tableStore.saveCellEditValue()

      if (isCtrlKey) {
        tableEditMoveCell({
          tableEl: tableEl.value,
          isCardView: isCardView.value,
          cellEdit: cellEdit.value,
          ev: { key: 'ArrowRight' },
        })
      } else {
        cellEdit.value = undefined
      }

      ev.preventDefault()
      ev.stopPropagation()
    } else if (isCtrlKey) {
      tableEditMoveCell({
        tableEl: tableEl.value,
        isCardView: isCardView.value,
        cellEdit: cellEdit.value,
        ev,
      })
    }
  }
})
</script>

<template>
  <VirtualScroller
    ref="virtualScrollEl"
    :rows="rowsSplit"
    class="table-content"
    :row-key
    :fetch-more="isFetchMore"
    :class="ui?.contentClass"
    :style="ui?.contentStyle"
    @virtual-scroll="handleVirtualScroll"
  >
    <template #default="{ row, index }">
      <slot
        name="row"
        :row
        :index
      >
        <TableRow
          :row
          :ui
          :index
          :editable
          :to
        >
          <!-- Field slots -->
          <template
            v-for="col in visibleColumns"
            :key="col.name"
            #[col.name]
          >
            <slot
              :name="col.name"
              :row
              :index
            />
          </template>

          <!-- Row inside slot -->
          <template #inner="rowInsideProps">
            <slot
              name="row-inside"
              v-bind="rowInsideProps"
            />
          </template>
        </TableRow>
      </slot>
    </template>
  </VirtualScroller>
</template>

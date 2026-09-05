// Store
import { usePivotStore } from '../stores/pivot.store'

export function usePivotScrollSync() {
  const {
    rowsVirtualScrollEl,
    valuesVirtualScrollEl,
    valueHeaderEl,
    rowHeaderEl,
    rowsWrapperEl,
  } = usePivotStore()

  const rowsScrollerEl = computed(() => rowsVirtualScrollEl.value?.element)
  const valuesScrollerEl = computed(() => valuesVirtualScrollEl.value?.element)

  const { x: rowsWrapperX } = useScroll(rowsWrapperEl)
  const { y: rowsY } = useScroll(rowsScrollerEl)
  const { y: valuesY, x: valuesX } = useScroll(valuesScrollerEl)
  const { x: rowsHeaderX } = useScroll(rowHeaderEl)
  const { x: valueHeaderX } = useScroll(valueHeaderEl)

  const stopVerticalSync = syncRef(rowsY, valuesY, { direction: 'both' })
  const stopHorizontalSync = syncRef(valuesX, valueHeaderX, { direction: 'both' })
  const stopRowsHorizontalSync = syncRef(rowsWrapperX, rowsHeaderX, { direction: 'both' })

  onScopeDispose(() => {
    stopVerticalSync()
    stopHorizontalSync()
    stopRowsHorizontalSync()
  })
}

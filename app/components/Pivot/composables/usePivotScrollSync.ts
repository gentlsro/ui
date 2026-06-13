// Store
import { usePivotStore } from '../stores/pivot.store'

function getScrollerEl(componentRef: Ref<unknown>) {
  const root = unrefElement(componentRef as any) as HTMLElement | undefined

  return root?.classList.contains('virtual-scroll')
    ? root
    : root?.querySelector('.virtual-scroll') as HTMLElement | undefined
}

function useScrollerEl(componentRef: Ref<unknown>) {
  return computed(() => getScrollerEl(componentRef))
}

export function usePivotScrollSync() {
  const {
    rowsVirtualScrollEl,
    valuesVirtualScrollEl,
    valueHeaderEl,
    rowHeaderEl,
    rowsWrapperEl,
  } = usePivotStore()

  const rowsScrollerEl = useScrollerEl(rowsVirtualScrollEl)
  const rowsHeaderScrollEl = computed(() => unrefElement(rowHeaderEl) as HTMLElement | undefined)
  const valuesScrollerEl = useScrollerEl(valuesVirtualScrollEl)
  const valueHeaderScrollEl = computed(() => unrefElement(valueHeaderEl) as HTMLElement | undefined)

  const { x: rowsWrapperX } = useScroll(rowsWrapperEl)
  const { y: rowsY } = useScroll(rowsScrollerEl)
  const { y: valuesY, x: valuesX } = useScroll(valuesScrollerEl)
  const { x: rowsHeaderX } = useScroll(rowsHeaderScrollEl)
  const { x: valueHeaderX } = useScroll(valueHeaderScrollEl)

  const stopVerticalSync = syncRef(rowsY, valuesY, { direction: 'both' })
  const stopHorizontalSync = syncRef(valuesX, valueHeaderX, { direction: 'both' })
  const stopRowsHorizontalSync = syncRef(rowsWrapperX, rowsHeaderX, { direction: 'both' })

  onScopeDispose(() => {
    stopVerticalSync()
    stopHorizontalSync()
    stopRowsHorizontalSync()
  })
}

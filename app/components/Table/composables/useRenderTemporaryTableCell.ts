// @vapor-ready
import type { ITableProps } from '../types/table-props.type'
import type { TableColumn } from '../models/table-column.model'

type CellMeasurement = {
  row: IItem
  col: TableColumn<any>
  index?: number
  ui?: ITableProps['ui']
}

export type TableMeasurementRequest = CellMeasurement & {
  id: number
  kind: 'cell' | 'header'
}

export type TableMeasurements = Pick<
  ReturnType<typeof useRenderTemporaryTableCell>,
  'getCellWidth' | 'getHeaderWidth'
>

/** Requests are rendered declaratively by the owning Table, preserving its context. */
export function useRenderTemporaryTableCell() {
  const requests = shallowRef<TableMeasurementRequest[]>([])
  const elements = new Map<number, HTMLElement>()
  let nextId = 0
  let disposed = false

  onScopeDispose(() => {
    disposed = true
    requests.value = []
    elements.clear()
  })

  async function measure(payload: Omit<TableMeasurementRequest, 'id'>) {
    // No DOM work or column-width mutations during SSR or after owner disposal.
    if (import.meta.server || disposed) {
      return undefined
    }

    const request = { ...payload, id: nextId++ }
    requests.value = [...requests.value, request]

    try {
      await nextTick()
      if (disposed) {
        return undefined
      }

      const element = elements.get(request.id)
      if (!element?.isConnected) {
        return undefined
      }

      return element.getBoundingClientRect().width
    } finally {
      elements.delete(request.id)
      requests.value = requests.value.filter(item => item.id !== request.id)
      // Callers can start the next autofit only after the previous slot is unmounted.
      await nextTick()
    }
  }

  function setElement(id: number, element: HTMLElement) {
    if (!disposed) {
      elements.set(id, element)
    }
  }

  function getCellWidth(payload: CellMeasurement) {
    return measure({ ...payload, kind: 'cell' })
  }

  function getHeaderWidth(col: TableColumn<any>, ui?: ITableProps['ui']) {
    return measure({ col, row: {}, ui, kind: 'header' })
  }

  return { requests, setElement, getCellWidth, getHeaderWidth }
}

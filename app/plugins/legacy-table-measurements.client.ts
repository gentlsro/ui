import { h, nextTick, render } from 'vue'
import TableMeasurement from '../components/Table/TableMeasurement.vue'
import type { LegacyTableCellSlot, TableMeasurementRequest, TableMeasurements } from '../components/Table/composables/useRenderTemporaryTableCell'

// Direct 2.3 TableColumn.autoFit calls used the app-wide VDOM host.
// Normal Table calls use their own native measurement component.
export default defineNuxtPlugin(nuxtApp => {
  async function measure(request: TableMeasurementRequest, slot?: LegacyTableCellSlot) {
    const host = document.createElement('div')
    document.body.append(host)
    try {
      const slots = slot
        ? { default: () => slot({
            row: request.row,
            index: request.index ?? 0,
            refreshDataFnc: () => {},
          }) }
        : undefined
      const vnode = h(TableMeasurement, { request }, slots)
      vnode.appContext = nuxtApp.vueApp._context
      render(vnode, host)
      await nextTick()

      return host.querySelector('[data-table-measurement]')?.getBoundingClientRect().width
    } finally {
      render(null, host)
      host.remove()
    }
  }

  const legacyTableMeasurements: TableMeasurements = {
    getCellWidth: payload => measure({ ...payload, id: 0, kind: 'cell' }, payload.slotRenderFnc),
    getHeaderWidth: (col, ui) => measure({ col, row: {}, ui, id: 0, kind: 'header' }),
  }

  return { provide: { legacyTableMeasurements } }
})

import { useTableAutoFit } from '../composables/useTableAutoFit'
import { useTableStore } from '../stores/table.store'

export function tableInitialize() {
  const { fitColumns } = useTableAutoFit()
  const tableStore = useTableStore()
  const { isInitialLoad, rows, loadData } = storeToRefs(tableStore)

  const isImmediate = loadData.value?.immediate || !rows.value.length

  tableStore.fetchAndSetMetaData()
    .then(() => {
      if (loadData.value?.fnc && isImmediate) {
        tableStore.fetchAndSetData({ force: true })
          .then(() => {
            fitColumns()
            isInitialLoad.value = false
          })
      } else {
        nextTick(fitColumns)
        isInitialLoad.value = false
      }
    })
}

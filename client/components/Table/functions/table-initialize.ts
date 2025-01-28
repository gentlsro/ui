import { useTableAutoFit } from '../composables/useTableAutoFit'
import { useTableStore } from '../stores/table.store'

export function tableInitialize() {
  const { fitColumns } = useTableAutoFit()
  const tableStore = useTableStore()
  const { isInitialLoad, rows, loadData } = storeToRefs(tableStore)

  const isImmediate = loadData.value?.immediate || !rows.value.length

  tableStore.fetchAndSetMetaData()
    .then(res => {
      if (typeof res === 'object' && res?._preventFetchData) {
        if (rows.value.length) {
          fitColumns()
        }
        isInitialLoad.value = false

        return
      }

      if (loadData.value?.fnc && isImmediate) {
        console.log('Table initialize')
        tableStore.fetchAndSetData({ force: true })
          .then(() => {
            if (rows.value.length) {
              fitColumns()
            }
            isInitialLoad.value = false
          })
      } else {
        nextTick(fitColumns)
        isInitialLoad.value = false
      }
    })
}

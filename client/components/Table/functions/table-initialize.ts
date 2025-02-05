import { useTableAutoFit } from '../composables/useTableAutoFit'
import { useTableStore } from '../stores/table.store'

export function tableInitialize() {
  const { fitColumns } = useTableAutoFit()
  const tableStore = useTableStore()
  const { isInitialLoad, rows, loadData } = storeToRefs(tableStore)

  const isImmediate = loadData.value?.immediate || !rows.value.length

  tableStore.fetchAndSetMetaData()
    .then(res => {
      // We may have returned a special property `_preventFetchData`, in which case
      // we do not fetch the data
      if (typeof res === 'object' && res?._preventFetchData) {
        if (rows.value.length) {
          setTimeout(() => fitColumns())
        }
        isInitialLoad.value = false

        return
      }

      if (loadData.value?.fnc && isImmediate) {
        tableStore.fetchAndSetData({ force: true })
          .then(() => {
            if (rows.value.length) {
              setTimeout(() => fitColumns())
            }
            isInitialLoad.value = false
          })
      } else {
        setTimeout(() => fitColumns())
        isInitialLoad.value = false
      }
    })
}

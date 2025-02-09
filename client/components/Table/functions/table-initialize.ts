import { useTableAutoFit } from '../composables/useTableAutoFit'
import { useTableStore } from '../stores/table.store'

export function tableInitialize() {
  const { fitColumns } = useTableAutoFit()
  const tableStore = useTableStore()
  const { isInitialLoad, rows, loadData, autofitConfig } = storeToRefs(tableStore)

  const isImmediate = loadData.value?.immediate || !rows.value.length

  function autoFit() {
    let mode: 'fit' | 'stretch' | 'justify' | undefined

    if (autofitConfig.value?.onInit === 'forced') {
      mode = autofitConfig.value.mode
    }

    nextTick(() => fitColumns(undefined, { mode }))
  }

  tableStore.fetchAndSetMetaData()
    .then(res => {
      // We may have returned a special property `_preventFetchData`, in which case
      // we do not fetch the data (for example in case we already got the data in the meta fetch)
      if (typeof res === 'object' && res?._preventFetchData) {
        if (rows.value.length) {
          autoFit()
        }
        isInitialLoad.value = false

        return
      }

      if (loadData.value?.fnc && isImmediate) {
        tableStore.fetchAndSetData({ force: true })
          .then(() => {
            if (rows.value.length) {
              autoFit()
            }

            isInitialLoad.value = false
          })
      } else {
        autoFit()
        isInitialLoad.value = false
      }
    })
}

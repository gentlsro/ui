// Store
import type { usePivotStore } from '../stores/pivot.store'

export async function pivotFetchData<T extends IItem = IItem>(payload: {
  getStore: () => ReturnType<typeof usePivotStore<T>>
}) {
  const { getStore } = payload
  const { fn, loadData } = getStore()

  const res = await fn(() => {
    return loadData.value?.fnc?.({ getStore })
  })

  const resModified = loadData.value?.onFetch?.({ res, getStore }) ?? res
  const { payloadKey = 'data', countKey = 'count' } = loadData.value ?? {}

  const items = payloadKey ? get(resModified, payloadKey, []) : (resModified ?? [])
  const hasCount = has(resModified, countKey)
  let totalRows: number | undefined

  // When count is available, use it
  if (hasCount) {
    totalRows = get(resModified, countKey)
  }

  return { items, totalRows }
}

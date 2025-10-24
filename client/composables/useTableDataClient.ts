import { useFiltering, useSorting } from '$utils'

// Types
import type { ITableFetchPayload } from '../components/Table/types/table-fetch-payload.type'
import type { ITableFilterItem } from '../components/Table/types/table-filter-item.type'

export function useTableDataClient() {
  // Utils
  const { sortData } = useSorting()
  const { filterData } = useFiltering()

  async function handleLocalFetch<T = IItem>(
    dataRef: MaybeRefOrGetter<T[]>,
    tableFetchInput: Pick<ITableFetchPayload, 'tableData'>,
    options?: { take?: number },
  ) {
    const { columnFilters, orderBy, pagination } = tableFetchInput.tableData

    const filtered = filterData(
      dataRef as any,
      columnFilters || ([] as ITableFilterItem<any>[]),
    )
    const rows = await sortData(filtered, orderBy || [])

    const { skip = 0, take = rows.length } = pagination ?? {}
    const paginatedRows = rows.slice(skip, skip + (options?.take ?? take))

    return { data: paginatedRows, count: rows?.length }
  }

  return {
    handleLocalFetch,
  }
}

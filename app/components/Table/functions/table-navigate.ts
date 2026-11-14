import type { LocationQuery, LocationQueryRaw } from '#vue-router'
import type { TableColumn } from '../models/table-column.model'

const TABLE_QUERY_KEYS = ['filters', 'qb', 'order', 'select', 'search', 'skip', 'take']

/**
 * Merges the table's query params into the given (live) route query, keeping
 * all the params that are not related to the table untouched
 */
export function tableBuildUrlQuery(payload: {
  columns: Pick<TableColumn, 'field'>[]
  currentQuery: LocationQuery
  queryParams: URLSearchParams
  isInfiniteScroll?: boolean
}): LocationQueryRaw {
  const { columns, currentQuery, isInfiniteScroll } = payload
  const queryParams = new URLSearchParams(payload.queryParams)
  const query: LocationQueryRaw = { ...currentQuery }

  // Get only non-table related params
  TABLE_QUERY_KEYS.forEach(key => delete query[key])

  // Remove all fields that are the present in the columns
  const columnFields = columns.map(column => column.field)
  columnFields.forEach(field => {
    delete query[field]
    queryParams.delete(field.toLowerCase())
  })

  // Merge the current params with the new ones
  queryParams.forEach((value, key) => {
    const paginationKeys = ['skip', 'take']

    if (isInfiniteScroll && paginationKeys.includes(key)) {
      return
    }

    query[key] = value
  })

  return query
}

export function tableNavigate(payload: {
  columns: TableColumn[]
  queryParams: URLSearchParams
  isInfiniteScroll?: boolean
  customData?: IItem
}) {
  const { columns, queryParams, isInfiniteScroll } = payload

  // We merge into the live route at write time (not into a snapshot), so we
  // don't drop params that someone else added in the meantime
  const route = useRouter().currentRoute.value

  const query = tableBuildUrlQuery({
    columns,
    currentQuery: route.query,
    queryParams,
    isInfiniteScroll,
  })

  // Pin the path (and keep the hash), so the write never moves the user elsewhere
  return navigateTo({ path: route.path, query, hash: route.hash }, { replace: true })
}

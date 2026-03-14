import type { TableColumn } from '../models/table-column.model'

export function tableNavigate(payload: {
  columns: TableColumn[]
  queryParams: URLSearchParams
  isInfiniteScroll?: boolean
  customData?: IItem
}) {
  const { columns, queryParams, isInfiniteScroll } = payload
  const currentParams = useRequestURL().searchParams

  // Get only non-table related params
  currentParams.delete('filters')
  currentParams.delete('qb')
  currentParams.delete('order')
  currentParams.delete('select')
  currentParams.delete('search')
  currentParams.delete('skip')
  currentParams.delete('take')

  // Remove all fields that are the present in the columns
  const columnFields = columns.map(column => column.field)
  columnFields.forEach(field => {
    currentParams.delete(field)
    queryParams.delete(field.toLowerCase())
  })

  // Merge the current params with the new ones
  queryParams.forEach((value, key) => {
    const paginationKeys = ['skip', 'take']

    if (isInfiniteScroll && paginationKeys.includes(key)) {
      return
    }

    currentParams.set(key, value)
  })

  // Sentry throws errors here for some reason...
  const query = currentParams.entries()?.reduce((agg, [key, value]) => {
    agg[key] = decodeURIComponent(value)

    return agg
  }, {} as IItem) ?? {}

  navigateTo({ query, replace: true })
}

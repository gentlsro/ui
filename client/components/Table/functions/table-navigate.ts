import type { TableColumn } from '../models/table-column.model'

export function tableNavigate(payload: {
  column: TableColumn[]
  queryParams: URLSearchParams
  isInfiniteScroll?: boolean
}) {
  const { queryParams, isInfiniteScroll } = payload
  console.log('Log ~ isInfiniteScroll:', isInfiniteScroll)
  const currentParams = useRequestURL().searchParams

  // Get only non-table related params
  currentParams.delete('filters')
  currentParams.delete('qb')
  currentParams.delete('order')
  currentParams.delete('select')
  currentParams.delete('search')
  currentParams.delete('skip')
  currentParams.delete('take')

  // Merge the current params with the new ones
  queryParams.forEach((value, key) => {
    const paginationKeys = ['skip', 'take']

    if (isInfiniteScroll && paginationKeys.includes(key)) {
      return
    }

    currentParams.set(key, value)
  })

  const query = currentParams.entries().reduce((agg, [key, value]) => {
    agg[key] = decodeURIComponent(value)

    return agg
  }, {} as IItem)

  navigateTo({ query, replace: true })
}

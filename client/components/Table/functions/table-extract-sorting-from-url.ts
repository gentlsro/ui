// Models
import type { TableColumn } from '../models/table-column.model'

/**
 * Extracts `sorting` from the URL
 * The URL might look like: `?order=(name.value.asc,id.desc)`
 */
export function tableExtractSortingFromUrl(
  params: URLSearchParams,
  options?: { key?: string },
): Array<Pick<TableColumn, 'field' | 'sort' | 'sortOrder'>> {
  const { key = 'order' } = options ?? {}
  const sort = params.get(key)

  if (!sort) {
    return []
  }

  let trimmedSort = sort.trim()
  trimmedSort = trimmedSort?.replace(/[()]/g, '') // Remove the brackets

  const sortFields = trimmedSort?.split(',') ?? []

  let sortOrder = 1
  const sorting = sortFields.reduce((agg, sortField) => {
    const fieldSplit = sortField.split('.')
    const direction = fieldSplit.pop() as 'asc' | 'desc'
    const fieldPath = fieldSplit.join('.')

    if (direction === 'asc' || direction === 'desc') {
      agg.push({
        field: fieldPath,
        sort: direction,
        sortOrder: sortOrder++,
      })
    }

    return agg
  }, [] as { field: string, sort: 'asc' | 'desc', sortOrder: number }[])

  return sorting
}

/**
 * Function that takes the serialized data and builds the URL query params out of it
 */
export function tableBuildQueryParams(payload: {
  sorting?: string
  select?: string
  filters?: string
  queryBuilder?: string
  take?: string
  skip?: string
  search?: string
}) {
  const urlParams = new URLSearchParams()

  // Query builder
  if (payload.queryBuilder) {
    urlParams.set('qb', payload.queryBuilder)
  }

  // Column filters
  if (payload.filters) {
    urlParams.set('filters', payload.filters)
  }

  // Sorting
  if (payload.sorting) {
    urlParams.set('order', `(${payload.sorting})`)
  }

  // Select
  if (payload.select) {
    urlParams.set('select', payload.select)
  }

  // Pagination
  if (payload.take) {
    urlParams.set('take', payload.take)
  }

  if (payload.skip) {
    urlParams.set('skip', payload.skip)
  }

  // Search
  if (payload.search) {
    urlParams.set('search', payload.search)
  }

  return urlParams
}

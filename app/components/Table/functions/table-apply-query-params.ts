// Functions
import { tableTransformColumns } from './table-transform-columns'
import { queryBuilderInitializeItems } from '../../QueryBuilder/functions/query-builder-initialize-items'

// Store
import type { useTableStore } from '../stores/table.store'

export type ITableApplyQueryParamsPayload = {
  params: string | URLSearchParams
  extend?: boolean
}

export function tableMergeQueryParams(payload: {
  current: URLSearchParams
  incoming: URLSearchParams
}) {
  const { current, incoming } = payload
  const result = new URLSearchParams(current)
  const incomingKeys = new Set(incoming.keys())

  incomingKeys.forEach(key => result.delete(key))
  incoming.forEach((value, key) => result.append(key, value))

  return result
}

export function tableApplyQueryParams(payload: ITableApplyQueryParamsPayload & {
  getStore: () => ReturnType<typeof useTableStore>
}): void {
  const {
    params,
    extend = false,
    getStore,
  } = payload

  const store = getStore()
  const incomingParams = new URLSearchParams(params)
  const effectiveParams = extend
    ? tableMergeQueryParams({
        current: store.queryParams.value,
        incoming: incomingParams,
      })
    : incomingParams

  const {
    columns,
    queryBuilder,
    pagination,
    search,
  } = tableTransformColumns({
    internalColumns: store.internalColumns.value,
    modifiers: store.modifiers.value,
    defaultSchema: '',
    urlSchema: effectiveParams,
    shouldSchemaBeUsed: false,
    forceUrlUsage: true,
  })

  if (!extend && !effectiveParams.get('select')) {
    columns.forEach(col => {
      if (!col.nonInteractive && !col.isHelperCol) {
        col.hidden = false
      }
    })
  }

  store.internalColumns.value = columns
  store.queryBuilder.value = queryBuilder.length
    ? queryBuilder
    : queryBuilderInitializeItems()
  store.search.value = search ?? ''

  const take = pagination?.take
  const skip = pagination?.skip

  if (take !== undefined && Number.isFinite(take) && take > 0) {
    store.paginationConfig.value.pageSize = take
  }

  const pageSize = store.paginationConfig.value.pageSize ?? 10
  store.currentPage.value = skip !== undefined && Number.isFinite(skip) && skip >= 0
    ? Math.floor(skip / pageSize) + 1
    : 1
}

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { queryBuilderInitializeItems } from '../../QueryBuilder/functions/query-builder-initialize-items'
import { tableTransformColumns } from './table-transform-columns'
import { tableApplyQueryParams, tableMergeQueryParams } from './table-apply-query-params'

vi.mock('./table-transform-columns', () => ({
  tableTransformColumns: vi.fn(),
}))

vi.mock('../../QueryBuilder/functions/query-builder-initialize-items', () => ({
  queryBuilderInitializeItems: vi.fn(() => [{ id: 'empty-query-builder-row' }]),
}))

function createStore() {
  return {
    currentPage: ref(3),
    internalColumns: ref([
      { field: 'name', hidden: true },
      { field: 'internal', hidden: true, nonInteractive: true },
      { field: 'selection', hidden: true, isHelperCol: true },
    ]),
    modifiers: ref({ caseInsensitive: true }),
    paginationConfig: ref({ pageSize: 25 }),
    queryBuilder: ref([{ id: 'existing-query-builder-row' }]),
    queryParams: ref(new URLSearchParams('search=existing&take=25&skip=50&keep=yes')),
    search: ref('existing'),
  }
}

describe('tableMergeQueryParams', () => {
  it('replaces incoming keys and preserves their repeated values', () => {
    const current = new URLSearchParams('tag=old&tag=older&keep=yes')
    const incoming = new URLSearchParams('tag=new&tag=newer')

    const result = tableMergeQueryParams({ current, incoming })

    expect(result.getAll('tag')).toEqual(['new', 'newer'])
    expect(result.get('keep')).toBe('yes')
    expect(current.toString()).toBe('tag=old&tag=older&keep=yes')
    expect(incoming.toString()).toBe('tag=new&tag=newer')
  })
})

describe('tableApplyQueryParams', () => {
  beforeEach(() => {
    vi.mocked(tableTransformColumns).mockReset()
    vi.mocked(queryBuilderInitializeItems).mockClear()
  })

  it('replaces query-controlled state without mutating the provided params', () => {
    const store = createStore()
    const params = new URLSearchParams('search=replaced')
    const transformedColumns = store.internalColumns.value.map(column => ({ ...column }))

    vi.mocked(tableTransformColumns).mockReturnValue({
      columns: transformedColumns,
      pagination: {},
      queryBuilder: [],
      search: 'replaced',
    } as ReturnType<typeof tableTransformColumns>)

    tableApplyQueryParams({
      params,
      getStore: () => store as never,
    })

    expect(params.toString()).toBe('search=replaced')
    expect(tableTransformColumns).toHaveBeenCalledWith(expect.objectContaining({
      modifiers: store.modifiers.value,
      shouldSchemaBeUsed: false,
      forceUrlUsage: true,
    }))
    expect(store.internalColumns.value.map(column => column.hidden)).toEqual([false, true, true])
    expect(store.queryBuilder.value).toEqual([{ id: 'empty-query-builder-row' }])
    expect(store.search.value).toBe('replaced')
    expect(store.paginationConfig.value.pageSize).toBe(25)
    expect(store.currentPage.value).toBe(1)
  })

  it('extends the current query while incoming keys take precedence', () => {
    const store = createStore()
    let effectiveParams: URLSearchParams | undefined

    vi.mocked(tableTransformColumns).mockImplementation(payload => {
      effectiveParams = payload.urlSchema as URLSearchParams

      return {
        columns: store.internalColumns.value,
        pagination: { skip: 60, take: 20 },
        queryBuilder: [{ id: 'applied-query-builder-row' }],
        search: 'extended',
      } as ReturnType<typeof tableTransformColumns>
    })

    tableApplyQueryParams({
      params: 'search=extended&tag=first&tag=second',
      extend: true,
      getStore: () => store as never,
    })

    expect(effectiveParams?.get('keep')).toBe('yes')
    expect(effectiveParams?.get('search')).toBe('extended')
    expect(effectiveParams?.getAll('tag')).toEqual(['first', 'second'])
    expect(store.queryBuilder.value).toEqual([{ id: 'applied-query-builder-row' }])
    expect(store.search.value).toBe('extended')
    expect(store.paginationConfig.value.pageSize).toBe(20)
    expect(store.currentPage.value).toBe(4)
    expect(queryBuilderInitializeItems).not.toHaveBeenCalled()
  })
})

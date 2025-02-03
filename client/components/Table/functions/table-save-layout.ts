// Types
import type { ITableProps } from '../types/table-props.type'
import type { ITableLayout } from '../types/table-layout.type'
import type { IQueryBuilderRow } from '../../QueryBuilder/types/query-builder-row-props.type'

// Models
import type { TableColumn } from '../models/table-column.model'

// Functions
import { tableSerializeData } from './table-serialize-data'
import { tableBuildQueryParams } from './table-build-query-params'

export async function tableSaveLayout(payload: {
  /**
   * Currently selected layout
   */
  layout: ITableLayout

  /**
   * Current internal columns
   */
  internalColumns: TableColumn[]

  /**
   * Which parts of the layout to save
   */
  toSave?: Array<'columns' | 'filters' | 'sorting' | ''>

  /**
   * Modifiers for the table functions
   */
  modifiers?: ITableProps['modifiers']

  /**
   * Query builder items
   */
  queryBuilder?: IQueryBuilderRow[]

  /**
   * Custom data provided from the table store
   */
  customData: IItem

  /**
   * Whether the layout is public
   */
  isPublic?: boolean

  /**
   * Whether the layout is default
   */
  isDefault?: boolean

  /**
   * Handle request function
   */
  handleRequest: ReturnType<typeof useRequest>['handleRequest']

  /**
   * Currently available layouts
   */
  layouts: ITableLayout[]
}) {
  const {
    layout,
    layouts,
    modifiers,
    internalColumns,
    queryBuilder = [],
    toSave,
    isDefault,
    isPublic,
  } = payload

  const {
    buildParams = tableBuildQueryParams,
  } = modifiers ?? {}
  const existingLayout = layouts.find(l => l.name === layout.name)

  const {
    filters: filtersSerialized,
    select: selectSerialized,
    sorting: sortingSerialized,
    queryBuilder: queryBuilderSerialized,
  } = tableSerializeData({
    columns: internalColumns,
    modifiers,
    queryBuilder,
  })

  const schema = buildParams({
    filters: toSave?.includes('filters') ? filtersSerialized : undefined,
    queryBuilder: toSave?.includes('filters') ? queryBuilderSerialized : undefined,
    select: toSave?.includes('columns') ? selectSerialized : undefined,
    sorting: toSave?.includes('sorting') ? sortingSerialized : undefined,
  })

  layout.schema = decodeURIComponent(schema.toString())
  layout.isDefault = isDefault
  layout.isPublic = isPublic

  if (existingLayout) {
    Object.assign(existingLayout, layout)

    return
  }

  layouts.push(layout)
}

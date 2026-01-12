// Types
import type { ITableProps } from '../types/table-props.type'
import type { ITableLayout } from '../types/table-layout.type'
import type { ITableFetchPayload } from '../types/table-fetch-payload.type'

// Functions
import { tableSerializeData } from './table-serialize-data'
import { tableBuildQueryParams } from './table-build-query-params'

export async function tableSaveLayout(payload: {
  /**
   * The row key
   */
  rowKey: string

  /**
   * The table payload
   */
  tablePayload: ITableFetchPayload

  /**
   * Currently selected layout
   */
  layout: ITableLayout

  /**
   * Which parts of the layout to save
   */
  toSave?: Array<'columns' | 'filters' | 'sorting' | ''>

  /**
   * Modifiers for the table functions
   */
  modifiers?: ITableProps['modifiers']

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
    tablePayload,
    toSave,
    isDefault,
    isPublic,
    rowKey,
  } = payload

  const { buildParams = tableBuildQueryParams } = modifiers ?? {}
  const { tableData } = tablePayload
  const existingLayout = layouts.find(l => l.name === layout.name)

  const {
    filters: filtersSerialized,
    select: selectSerialized,
    sorting: sortingSerialized,
    queryBuilder: queryBuilderSerialized,
  } = tableSerializeData({
    rowKey,
    columns: tableData.columns,
    modifiers,
    queryBuilder: tableData.queryBuilder,
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
  } else {
    layout.id = generateUUID()
  }

  layouts.push(layout)
}

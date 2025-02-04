import { FilterItem } from '$utils'

// Types
import type { ITableStateColumn } from '../types/table-state-column.type'

// Models
import { TableColumn } from '../models/table-column.model'

export function tableMergeColumns(payload: {
  propsColumns?: TableColumn<any>[]
  apiColumns?: Partial<TableColumn<any>>[]
  stateColumns?: ITableStateColumn[]
  useState?: boolean
}) {
  const {
    propsColumns = [],
    apiColumns = [],
    stateColumns = [],
    useState = true,
  } = payload

  const colFields = uniq([...propsColumns, ...apiColumns, ...stateColumns]
    .map(col => col.field))

  return colFields.map(colField => {
    const propsCol = (propsColumns.find(col => col.field === colField) ?? {})
    const apiCol = (apiColumns.find(col => col.field === colField) ?? {})
    const stateCol = useState
      ? (stateColumns.find(col => col.field === colField) ?? {})
      : undefined

    // Merge the column objects, with given priority: state > props > api
    const col = merge({}, apiCol, propsCol, stateCol) as TableColumn<any>
    console.log('Log ~ stateCol:', stateCol)
    console.log('Log ~ propsCol:', propsCol)
    console.log('Log ~ apiCol:', apiCol)
    console.log('Log ~ col:', col)

    col.misc = {
      ...col.misc,
      isApiCol: !!apiCol,
      isStateCol: !!stateCol,
      isPropsCol: !!propsCol,
    }

    const filters = col.filters?.map(f => new FilterItem(f)) ?? []

    return new TableColumn({ ...col, filters })
  })
}

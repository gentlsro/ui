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
  isMetaLoading?: boolean
}) {
  const {
    propsColumns = [],
    apiColumns = [],
    stateColumns = [],
    isMetaLoading = false,
    useState = true,
  } = payload

  const colFields = uniq([...propsColumns, ...apiColumns, ...stateColumns]
    .map(col => col.field))

  console.log(2)
  return colFields.map(colField => {
    const propsCol = (propsColumns.find(col => col.field === colField))
    const apiCol = (apiColumns.find(col => col.field === colField))
    let stateCol = stateColumns.find(col => col.field === colField)

    // Make sure to remove columns that are only in the state but not in any other sources
    // But only if there actually are some api columns
    if (!isMetaLoading && !apiCol && !propsCol) {
      return null
    }

    // In case we don't want to use state, we just extract the `field` and `width`
    // from the state col to keep consistency. We do not include filters, sorting,...
    if (!useState && stateCol) {
      stateCol = pick(stateCol, ['field', 'width']) as ITableStateColumn
    }

    // Merge the column objects, with given priority: state > props > api
    const col = merge({}, apiCol, propsCol, stateCol) as TableColumn<any>

    if (colField === 'name') {
      console.log('💀 API Col', apiCol)
      console.log('💀 Props Col', propsCol)
      console.log('💀 State Col', stateCol)
      console.log('💀 Col', col)
    }

    col.misc = {
      ...col.misc,
      isApiCol: !!apiCol,
      isStateCol: !!stateCol,
      isPropsCol: !!propsCol,
    }

    const filters = col.filters?.map(f => new FilterItem(f)) ?? []

    return new TableColumn({ ...col, filters })
  }).filter(Boolean) as TableColumn<any>[]
}

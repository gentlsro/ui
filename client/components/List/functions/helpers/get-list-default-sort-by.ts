// Types
import type { IListProps } from '../../types/list-props.type'

// Models
import { SortItem } from '$utils/shared/models/sort-item.model'

export function getListDefaultSortBy(itemLabel?: IListProps['itemLabel']) {
  return [
    new SortItem({
      field: '_label',
      sort: 'asc',
      format: row => {
        return typeof itemLabel === 'function'
          ? itemLabel(row)
          : get(row, itemLabel ?? 'label')
      },
    }),
  ]
}

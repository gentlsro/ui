import { isDayjs } from 'dayjs'

// Types
import type { ITableFilterItem } from '../types/table-filter-item.type'
import type { IQueryBuilderRow } from '../../QueryBuilder/types/query-builder-row-props.type'

// Constants
import { NON_VALUE_COMPARATORS, SELECTOR_COMPARATORS } from '$utils'

export function tableSerializeFilters(
  filtersOrQueryBuilder: Array<ITableFilterItem | IQueryBuilderRow>,
): string {
  return filtersOrQueryBuilder
    .map(row => {
      // Group
      if ('isGroup' in row) {
        const condition = row.condition.toLowerCase()

        if (!row.children.length) {
          return undefined
        }

        return `${condition}(${tableSerializeFilters(row.children)})`
      }

      // Regular item
      else {
        const item = row as ITableFilterItem
        let val: string | number = item.value

        // Date
        if (isDayjs(item.value)) {
          val = item.value.format('YYYY-MM-DD')
        }

        // Array
        if (Array.isArray(item.value)) {
          val = `(${item.value.join(',')})`
        }

        // Includes comma & is SELECTOR_COMPARATOR
        const isSelectorComparator = SELECTOR_COMPARATORS
          .includes(item.comparator)

        if (
          typeof item.value === 'string'
          && item.value.includes(',')
          && isSelectorComparator
        ) {
          val = `(${item.value})`
        }

        const isNonValueComparator = NON_VALUE_COMPARATORS
          .includes(item.comparator)

        if (isNonValueComparator) {
          return `[${item.filterField ?? item.field}].[${item.comparator}]`
        }

        const hasNoValue = isNil(item.value)

        if (hasNoValue) {
          return undefined
        }

        return `[${item.filterField ?? item.field}].[${item.comparator}].[${val}]`
      }
    })
    .filter(Boolean)
    .filter(row => {
      const isEmptyCondition = row === 'and()' || row === 'or()'

      return !isEmptyCondition
    })
    .join(',')
}

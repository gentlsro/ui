import { FilterItem, parseValue } from '$utils'

// Types
import type { ITableProps } from '../types/table-props.type'
import type { IQueryBuilderItem } from '../../QueryBuilder/types/query-builder-item-props.type'

// Models
import { TableColumn } from '../models/table-column.model'

// Functions
import { tableExtractDataFromUrl } from './table-extract-data-from-url'

function getUsedProperties(payload: {
  shouldUrlBeUsed?: boolean
  shouldSchemaBeUsed?: boolean
  modifiers: ITableProps['modifiers']
  schemaResult: ReturnType<typeof tableExtractDataFromUrl>
  urlResult: ReturnType<typeof tableExtractDataFromUrl>
}) {
  const { shouldUrlBeUsed, shouldSchemaBeUsed, schemaResult, urlResult, modifiers } = payload

  const isUrlUsed = shouldUrlBeUsed
    && (urlResult.filters.length
      || urlResult.sort.length
      || urlResult.queryBuilder.length
      || urlResult.visibleColumns.length)

  const isSchemaUsed = shouldSchemaBeUsed
    && (schemaResult.filters.length
      || schemaResult.sort.length
      || schemaResult.queryBuilder.length
      || schemaResult.visibleColumns.length)

  return {
    isUrlUsed: !!isUrlUsed,
    isSchemaUsed: !!isSchemaUsed,
    result: (isUrlUsed && modifiers?.useUrl) ? urlResult : schemaResult,
  }
}

/**
 * Transforms the columns based on the configuration in the schema or URL
 */
export function tableTransformColumns(payload: {
  internalColumns: TableColumn<any>[]
  modifiers: ITableProps['modifiers']
  urlParams: URLSearchParams | string
  schemaParams: URLSearchParams | string
  shouldUrlBeUsed?: boolean
  shouldSchemaBeUsed?: boolean
}) {
  const {
    internalColumns,
    modifiers,
    urlParams,
    schemaParams,
    shouldUrlBeUsed = true,
    shouldSchemaBeUsed = true,
  } = payload

  // Create a copy of the columns
  let _columns = internalColumns.map(col => new TableColumn(col))

  if (!shouldUrlBeUsed && !shouldSchemaBeUsed) {
    return { columns: _columns, queryBuilder: [] }
  }

  // Schema result
  const schemaResult = tableExtractDataFromUrl({
    columns: _columns,
    modifiers,
    searchParams: schemaParams,
  })

  // URL result
  const urlResult = tableExtractDataFromUrl({
    columns: _columns,
    modifiers,
    searchParams: urlParams,
  })

  const { result, isUrlUsed, isSchemaUsed } = getUsedProperties({
    shouldUrlBeUsed,
    shouldSchemaBeUsed,
    schemaResult,
    urlResult,
    modifiers,
  })

  if (!isSchemaUsed && !isUrlUsed) {
    return { columns: _columns, queryBuilder: [] }
  }

  const { filters, queryBuilder, sort, visibleColumns } = result

  const _visibleColumns = visibleColumns.map(col => modifiers?.caseInsensitive ? col.toLowerCase() : col)

  // Handle order of the columns, their visibility, filters and sorting
  _columns = _columns
    .map(col => {
      const colField = modifiers?.caseInsensitive ? col.field.toLowerCase() : col.field

      // Order and visibility
      if (_visibleColumns.length) {
        // Order of the columns and their visibility
        const orderIdx = col.isHelperCol ? -1000 : _visibleColumns.indexOf(colField)
        const isVisible = col.isHelperCol || orderIdx > -1

        col.hidden = col.nonInteractive ? col.hidden : !isVisible
        col._internalSort = col.nonInteractive ? (col._internalSort ?? -1) : orderIdx
      }

      // Sorting
      if (sort.length) {
        // Get the sort item
        const sortItem = sort.find(s => {
          const sortField = modifiers?.caseInsensitive
            ? s.field.toLowerCase()
            : s.field

          return sortField === colField
        })

        col.sort = sortItem?.sort
        col.sortOrder = sortItem?.sortOrder
      }

      // Filtering
      if (filters.length) {
        // Get filters for the column
        const filterItems = (filters as IQueryBuilderItem[])
          .filter(f => f.field === colField || f.filterField === colField)

        // First, we add the predefined filters
        col.filters = col.filtersPredefined ?? []

        // Then, we add the filters from the URL / schema and possibly merge the
        // filters from the URL / schema with the predefined filters (based on comparator)
        const toMerge: FilterItem[] = []

        col.filters = [
          ...col.filters,
          ...filterItems
            .map(filter => {
              const parseValueOptions = { dateFormat: 'YYYY-MM-DD', comparator: filter.comparator }
              const colProps = pick(col, [
                'field',
                'filterField',
                'dataType',
                'format',
                'filterFormat',
                'customDbQueryFnc',
              ])

              let value: any

              if (Array.isArray(filter.value)) {
                value = filter.value.map(v => parseValue(v, col.dataType, parseValueOptions))
              } else {
                value = parseValue(filter.value, col.dataType, parseValueOptions)
              }

              const filterModel = new FilterItem({ ...filter, ...colProps, value })

              // We mark the filter as predefined if it's part of the predefined filters
              // to later merge them (the values) together and eventually remove the non-predefined filters
              const isPartOfPredefined = col.filtersPredefined
                ?.some(f => f.comparator === filter.comparator)

              if (isPartOfPredefined) {
                filterModel.misc = { isPredefined: true }
                // toMerge.push(filterModel)
              }

              return filterModel
            })
            .filter(f => !f.misc?.isPredefined),
        ]

        // We overwrite the values of the filters with the same comparator
        toMerge.forEach(f => {
          const filterWithSameComparator = col.filters.find(f2 => f2.comparator === f.comparator)

          if (filterWithSameComparator) {
            filterWithSameComparator.value = f.value
          }
        })
      }

      return col
    })
    .toSorted((a, b) => {
      const aSort = a._internalSort ?? -1
      const bSort = b._internalSort ?? -1

      return aSort - bSort
    })

  return {
    queryBuilder,
    columns: _columns,
    filtersUsed: !!filters.length,
    sortUsed: !!sort.length,
    selectUsed: !!visibleColumns.length,
    queryBuilderUsed: !!queryBuilder.length,
    pagination: result.pagination,
  }
}

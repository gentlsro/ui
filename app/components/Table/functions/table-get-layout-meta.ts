// Types
import type { ITableLayout } from '../types/table-layout.type'

/**
 * Function that determines what parts have been saved within the layout, like
 * columns, filters, sorting, etc.
 */
export function tableGetLayoutMeta(layout: ITableLayout) {
  const { schema, isPublic, isDefault } = layout

  const params = new URLSearchParams(schema)

  const hasFilters = params.has('filters') || params.has('qb')
  const hasSorting = params.has('order')
  const hasSelect = params.has('select')
  const hasPagination = params.has('take') || params.has('skip')

  return {
    hasFilters,
    hasSorting,
    hasSelect,
    hasPagination,
    isPublic,
    isDefault,
  }
}

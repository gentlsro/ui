// Models
import type { PivotItem } from '../models/pivot-item.model'

// Functions
import { getActivePivotFilterItems } from './pivot-filter-usage'
import type { IPivotTransformWorkerFilter } from './pivot-transform-worker-payload'

function applyPivotFilters<T extends IItem>(data: T[], filters: FilterItem<T>[]) {
  if (!filters.length) {
    return data
  }

  const { filterData } = useFiltering()

  return filterData(data, filters)
}

export function applyPivotSerializedFilters<T extends IItem>(
  data: T[],
  filters: IPivotTransformWorkerFilter<T>[],
): T[] {
  if (!filters.length) {
    return data
  }

  return applyPivotFilters(data, filters.map(filter => new FilterItem<T>({
    field: filter.field,
    dataType: filter.dataType,
    comparator: filter.comparator,
    value: filter.filterValue,
  })))
}

export function applyPivotDataFilters<T extends IItem>(
  data: T[],
  items: PivotItem<T>[],
): T[] {
  return applyPivotFilters(data, getActivePivotFilterItems(items))
}

export function resolvePivotFilteredData<T extends IItem>(
  data: T[],
  payload: {
    items?: PivotItem<T>[]
    filters?: IPivotTransformWorkerFilter<T>[]
  },
): T[] {
  if (payload.items?.length) {
    return applyPivotDataFilters(data, payload.items)
  }

  if (payload.filters?.length) {
    return applyPivotSerializedFilters(data, payload.filters)
  }

  return data
}

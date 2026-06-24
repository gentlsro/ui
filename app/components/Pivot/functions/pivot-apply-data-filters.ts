// Models
import type { PivotItem } from '../models/pivot-item.model'

// Functions
import { applyPivotSerializedFilters } from './pivot-filter-serialized-data'
import { getActivePivotFilterItems } from './pivot-filter-items'
import type { IPivotTransformWorkerFilter } from './pivot-transform-worker-payload'

function applyPivotFilters<T extends IItem>(data: T[], filters: FilterItem<T>[]) {
  if (!filters.length) {
    return data
  }

  const { filterData } = useFiltering()

  return filterData(data, filters)
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
    transliterate?: boolean
  },
): T[] {
  if (payload.items?.length) {
    return applyPivotDataFilters(data, payload.items)
  }

  if (payload.filters?.length) {
    return applyPivotSerializedFilters(data, payload.filters, {
      transliterate: payload.transliterate,
    })
  }

  return data
}

export { applyPivotSerializedFilters }

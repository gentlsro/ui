import type { IPivotTransformWorkerFilter } from './pivot-transform-worker-payload'

export function applyPivotSerializedFilters<T extends IItem>(
  data: T[],
  filters: IPivotTransformWorkerFilter<T>[],
  options?: { transliterate?: boolean },
): T[] {
  if (!filters.length) {
    return data
  }

  const { normalizeText } = useText()

  return filterData({
    data,
    filters: filters.map(filter => ({
      field: filter.field,
      dataType: filter.dataType,
      comparator: filter.comparator,
      value: filter.filterValue,
    })),
    normalizeText,
    transliterate: options?.transliterate,
  })
}

import { get } from 'lodash-es'
import type { ExtendedDataType } from '$dataType'

const PIVOT_DATE_DATA_TYPE_RE = /^(?:date|datetime|timestamp|fullDateTime|yearMonth)(?:Simple)?$/

function isPivotDateDataType(dataType?: ExtendedDataType) {
  if (!dataType) {
    return false
  }

  if (PIVOT_DATE_DATA_TYPE_RE.test(dataType)) {
    return true
  }

  // Support app-extended date types when the autoimport is available.
  return typeof getDateTypes === 'function' && getDateTypes().includes(dataType)
}

function resolvePivotGroupKey(value: unknown, dataType?: ExtendedDataType) {
  if (value == null) {
    return ''
  }

  if (!isPivotDateDataType(dataType)) {
    return String(value)
  }

  const timestamp = getDateSimpleValue(value as Datetime)

  return Number.isFinite(timestamp) ? String(timestamp) : ''
}

export function pivotGroupBy<T>(
  items: T[],
  field: ObjectKey<T>,
  dataType?: ExtendedDataType,
): Map<string, T[]> {
  const map = new Map<string, T[]>()

  for (const item of items) {
    const key = resolvePivotGroupKey(get(item, field), dataType)
    const group = map.get(key)

    if (group) {
      group.push(item)
    } else {
      map.set(key, [item])
    }
  }

  return map
}

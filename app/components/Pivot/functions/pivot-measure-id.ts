import type { IPivotValueUsageSlot, PivotItem } from '../models/pivot-item.model'

let fallbackMeasureId = 0

function encodeMeasureField(field: PropertyKey) {
  return encodeURIComponent(String(field))
}

export function getLegacyPivotMeasureId(field: PropertyKey, index: number) {
  return `pivot-measure:${encodeMeasureField(field)}:${index}`
}

export function resolvePivotMeasureId<T = IItem>(
  field: PropertyKey,
  slot: IPivotValueUsageSlot<T>,
) {
  return slot.id ?? getLegacyPivotMeasureId(field, slot.index)
}

export function createPivotMeasureId(field: PropertyKey) {
  const uuid = globalThis.crypto?.randomUUID?.()

  if (uuid) {
    return `pivot-measure:${encodeMeasureField(field)}:${uuid}`
  }

  fallbackMeasureId += 1

  return `pivot-measure:${encodeMeasureField(field)}:${Date.now()}-${fallbackMeasureId}`
}

export function normalizePivotMeasureIds<T extends IItem>(items: PivotItem<T>[]) {
  const usedIds = new Set<string>()

  for (const item of items) {
    for (const slot of [...(item.usage.value ?? [])].toSorted((a, b) => a.index - b.index)) {
      let id = resolvePivotMeasureId(item.field, slot)

      if (usedIds.has(id)) {
        id = createPivotMeasureId(item.field)
      }

      slot.id = id
      usedIds.add(id)
    }
  }
}

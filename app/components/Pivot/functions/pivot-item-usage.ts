// Models
import { SummaryEnum } from '#layers/utilities/shared/enums/summary.enum'
import type { IPivotFilterSlot } from './pivot-filter-usage'
import type { IPivotValueUsageSlot, PivotItem } from '../models/pivot-item.model'
import type { IPivotTransformValueField } from './pivot-transform-data-core'

type IPivotSingleUsageRole = 'row' | 'column'
type IPivotMultiUsageRole = 'value' | 'filter'

export function getPivotItemsBySingleUsage<T extends IItem>(
  items: PivotItem<T>[],
  role: IPivotSingleUsageRole,
) {
  return items
    .filter(item => item.usage[role])
    .toSorted((a, b) => a.usage[role]!.index - b.usage[role]!.index)
}

export function resolvePivotValueField<T extends IItem>(
  item: PivotItem<T>,
  slot: IPivotValueUsageSlot<T>,
): IPivotTransformValueField<T> {
  return {
    field: item.field,
    summaryType: slot.summaryType ?? SummaryEnum.SUM,
    summaryFormat: slot.summaryFormat,
    widthResolved: item.widthResolved,
    _label: item._label,
    item,
  }
}

export function resolvePivotValueFields<T extends IItem>(
  items: PivotItem<T>[],
): IPivotTransformValueField<T>[] {
  const entries: { item: PivotItem<T>, slot: IPivotValueUsageSlot<T> }[] = []

  for (const item of items) {
    for (const slot of item.usage.value ?? []) {
      entries.push({ item, slot })
    }
  }

  return entries
    .toSorted((a, b) => a.slot.index - b.slot.index)
    .map(({ item, slot }) => resolvePivotValueField(item, slot))
}

export function getPivotItemsByMultiUsage<T extends IItem>(
  items: PivotItem<T>[],
  role: IPivotMultiUsageRole,
) {
  const entries: { item: PivotItem<T>, index: number }[] = []

  for (const item of items) {
    for (const slot of item.usage[role] ?? []) {
      entries.push({ item, index: slot.index })
    }
  }

  return entries
    .toSorted((a, b) => a.index - b.index)
    .map(entry => entry.item)
}

export function getPivotFilterItems<T extends IItem>(items: PivotItem<T>[]) {
  return items
    .filter(item => item.usage.filter !== undefined)
    .toSorted((a, b) => {
      const aIndex = a.usage.filter?.[0]?.index ?? items.indexOf(a)
      const bIndex = b.usage.filter?.[0]?.index ?? items.indexOf(b)

      return aIndex - bIndex
    })
}

export function syncPivotSingleUsageIndices<T extends IItem>(payload: {
  items: Ref<PivotItem<T>[]>
  ordered: PivotItem<T>[]
  role: IPivotSingleUsageRole
}) {
  const { items, ordered, role } = payload
  const orderedSet = new Set(ordered)

  for (const item of items.value) {
    if (orderedSet.has(item)) {
      item.usage[role] = { index: ordered.indexOf(item) }
    } else if (item.usage[role]) {
      delete item.usage[role]
    }
  }
}

export function syncPivotMultiUsageIndices<T extends IItem>(payload: {
  items: Ref<PivotItem<T>[]>
  ordered: PivotItem<T>[]
  role: IPivotMultiUsageRole
}) {
  const { items, ordered, role } = payload

  if (role === 'filter') {
    const previousSlots = new Map(
      items.value.map(item => [
        item,
        [...(item.usage.filter ?? [])].toSorted((a, b) => a.index - b.index),
      ]),
    )
    const filterItems = new Set(
      items.value.filter(item => item.usage.filter !== undefined),
    )

    for (const item of items.value) {
      delete item.usage.filter
    }

    ordered.forEach((item, index) => {
      if (!filterItems.has(item)) {
        return
      }

      item.usage.filter ??= []

      const slot = previousSlots.get(item)?.shift()

      if (slot) {
        item.usage.filter.push({ ...slot, index })
        return
      }

      item.usage.filter.push({ index } as IPivotFilterSlot<T>)
    })

    return
  }

  const previousSlots = new Map(
    items.value.map(item => [
      item,
      [...(item.usage.value ?? [])].toSorted((a, b) => a.index - b.index),
    ]),
  )

  for (const item of items.value) {
    delete item.usage.value
  }

  ordered.forEach((item, index) => {
    const slot = previousSlots.get(item)?.shift()

    if (!slot) {
      item.usage.value ??= []
      item.usage.value.push({ index })
      return
    }

    item.usage.value ??= []
    item.usage.value.push({ ...slot, index })
  })
}

import type { Ref } from 'vue'

import type { IPivotValueUsageSlot, PivotItem } from '../models/pivot-item.model'
import {
  getPivotFilterItems,
  getPivotItemsBySingleUsage,
  syncPivotMultiUsageIndices,
  syncPivotSingleUsageIndices,
} from './pivot-item-usage'
import { createPivotMeasureId } from './pivot-measure-id'

export type IPivotConfigurationRole = 'row' | 'column' | 'filter' | 'value'

export type IPivotConfigurationValueEntry<T extends IItem = IItem> = {
  item: PivotItem<T>
  slot: IPivotValueUsageSlot<T>
  id: string
}

function asItemsRef<T extends IItem>(items: PivotItem<T>[]) {
  return { value: items } as Ref<PivotItem<T>[]>
}

function uniqueItems<T extends IItem>(ordered: PivotItem<T>[]) {
  return ordered.filter((item, index) => ordered.indexOf(item) === index)
}

function insertItemAt<T extends IItem>(
  ordered: PivotItem<T>[],
  item: PivotItem<T>,
  index: number,
) {
  const nextOrdered = ordered.filter(current => current !== item)
  const nextIndex = Math.max(0, Math.min(index, nextOrdered.length))

  nextOrdered.splice(nextIndex, 0, item)

  return nextOrdered
}

export function movePivotConfigurationEntry<TEntry>(
  entries: TEntry[],
  from: number,
  to: number,
) {
  const nextEntries = [...entries]
  const [entry] = nextEntries.splice(from, 1)

  if (entry === undefined) {
    return entries
  }

  nextEntries.splice(Math.max(0, Math.min(to, nextEntries.length)), 0, entry)

  return nextEntries
}

export function getPivotConfigurationValueEntries<T extends IItem>(
  items: PivotItem<T>[],
) {
  const entries: IPivotConfigurationValueEntry<T>[] = []

  for (const item of items) {
    for (const slot of item.usage.value ?? []) {
      entries.push({ item, slot, id: slot.id! })
    }
  }

  return entries.toSorted((a, b) => a.slot.index - b.slot.index)
}

export function isPivotConfigurationItemUsed<T extends IItem>(item: PivotItem<T>) {
  return !!(
    item.usage.row
    || item.usage.column
    || item.usage.value?.length
    || item.usage.filter !== undefined
  )
}

export function clearPivotConfigurationItemUsage<T extends IItem>(item: PivotItem<T>) {
  delete item.usage.row
  delete item.usage.column
  delete item.usage.value
  delete item.usage.filter
}

export function setPivotConfigurationValueOrder<T extends IItem>(
  items: PivotItem<T>[],
  entries: IPivotConfigurationValueEntry<T>[],
) {
  for (const item of items) {
    delete item.usage.value
  }

  entries.forEach((entry, index) => {
    entry.item.usage.value ??= []
    entry.item.usage.value.push({ ...entry.slot, index })
  })
}

export function setPivotConfigurationRoleOrder<T extends IItem>(
  items: PivotItem<T>[],
  role: IPivotConfigurationRole,
  ordered: PivotItem<T>[],
) {
  const itemsRef = asItemsRef(items)

  switch (role) {
    case 'row':
      syncPivotSingleUsageIndices({ items: itemsRef, ordered: uniqueItems(ordered), role: 'row' })
      break
    case 'column':
      syncPivotSingleUsageIndices({ items: itemsRef, ordered: uniqueItems(ordered), role: 'column' })
      break
    case 'filter':
      syncPivotMultiUsageIndices({ items: itemsRef, ordered: uniqueItems(ordered), role: 'filter' })
      break
    case 'value':
      syncPivotMultiUsageIndices({ items: itemsRef, ordered, role: 'value' })
      break
  }
}

export function normalizePivotConfigurationUsage<T extends IItem>(items: PivotItem<T>[]) {
  setPivotConfigurationRoleOrder(items, 'row', getPivotItemsBySingleUsage(items, 'row'))
  setPivotConfigurationRoleOrder(items, 'column', getPivotItemsBySingleUsage(items, 'column'))
  setPivotConfigurationRoleOrder(items, 'filter', getPivotFilterItems(items))
  setPivotConfigurationValueOrder(items, getPivotConfigurationValueEntries(items))
}

export function addPivotConfigurationRole<T extends IItem>(payload: {
  items: PivotItem<T>[]
  item: PivotItem<T>
  role: IPivotConfigurationRole
  index: number
}) {
  const { items, item, role, index } = payload

  switch (role) {
    case 'row':
      setPivotConfigurationRoleOrder(
        items,
        'row',
        insertItemAt(getPivotItemsBySingleUsage(items, 'row'), item, index),
      )
      break
    case 'column':
      setPivotConfigurationRoleOrder(
        items,
        'column',
        insertItemAt(getPivotItemsBySingleUsage(items, 'column'), item, index),
      )
      break
    case 'filter':
      item.usage.filter ??= []
      setPivotConfigurationRoleOrder(
        items,
        'filter',
        insertItemAt(getPivotFilterItems(items), item, index),
      )
      break
    case 'value': {
      const entries = getPivotConfigurationValueEntries(items)
      const slot = {
        id: createPivotMeasureId(item.field),
        index,
        summaryType: isNumberDataType(item.dataType)
          ? SummaryEnum.SUM
          : SummaryEnum.COUNT,
      }

      entries.splice(Math.max(0, Math.min(index, entries.length)), 0, {
        item,
        slot,
        id: slot.id,
      })
      setPivotConfigurationValueOrder(items, entries)
      break
    }
  }

  normalizePivotConfigurationUsage(items)
}

export function removePivotConfigurationRole<T extends IItem>(payload: {
  items: PivotItem<T>[]
  item: PivotItem<T>
  role: IPivotConfigurationRole
  measureId?: string
}) {
  const { items, item, role, measureId } = payload

  if (role === 'value') {
    const entries = getPivotConfigurationValueEntries(items).filter(entry => {
      return measureId ? entry.id !== measureId : entry.item !== item
    })

    setPivotConfigurationValueOrder(items, entries)
    normalizePivotConfigurationUsage(items)

    return
  }

  const ordered = role === 'row'
    ? getPivotItemsBySingleUsage(items, 'row')
    : role === 'column'
      ? getPivotItemsBySingleUsage(items, 'column')
      : getPivotFilterItems(items)

  setPivotConfigurationRoleOrder(items, role, ordered.filter(entry => entry !== item))
  normalizePivotConfigurationUsage(items)
}

export function duplicatePivotConfigurationValue<T extends IItem>(payload: {
  items: PivotItem<T>[]
  measureId: string
}) {
  const entries = getPivotConfigurationValueEntries(payload.items)
  const index = entries.findIndex(entry => entry.id === payload.measureId)
  const entry = entries[index]

  if (!entry) {
    return
  }

  const id = createPivotMeasureId(entry.item.field)

  entries.splice(index + 1, 0, {
    item: entry.item,
    slot: { ...entry.slot, id, index: index + 1 },
    id,
  })
  setPivotConfigurationValueOrder(payload.items, entries)
  normalizePivotConfigurationUsage(payload.items)
}

export function togglePivotConfigurationItem<T extends IItem>(payload: {
  items: PivotItem<T>[]
  item: PivotItem<T>
}) {
  if (isPivotConfigurationItemUsed(payload.item)) {
    clearPivotConfigurationItemUsage(payload.item)
    normalizePivotConfigurationUsage(payload.items)

    return
  }

  addPivotConfigurationRole({
    ...payload,
    role: 'row',
    index: getPivotItemsBySingleUsage(payload.items, 'row').length,
  })
}

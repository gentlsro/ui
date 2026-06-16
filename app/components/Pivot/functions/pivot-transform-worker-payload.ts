import { klona } from 'klona/full'
import { toRaw } from 'vue'
import type { ExtendedDataType } from '$dataType'
import type { ComparatorEnum } from '$comparatorEnum'

// Models
import type { PivotItem } from '../models/pivot-item.model'

import type {
  IPivotTransformColumnField,
  IPivotTransformCorePayload,
  IPivotTransformRowField,
  IPivotTransformValueField,
} from './pivot-transform-data-core'
import { getActivePivotFilterItems } from './pivot-filter-items'

export type IPivotTransformWorkerRow<T extends IItem = IItem> = IPivotTransformRowField<T>

export type IPivotTransformWorkerColumn<T extends IItem = IItem> = IPivotTransformColumnField<T> & {
  minWidth?: PivotItem<T>['minWidth']
  width?: PivotItem<T>['width']
  widthResolved?: PivotItem<T>['widthResolved']
  _label: string
}

export type IPivotTransformWorkerValue<T extends IItem = IItem> = Pick<
  IPivotTransformValueField<T>,
  'field' | 'summaryType' | 'widthResolved'
> & {
  dataType?: PivotItem<T>['dataType']
  minWidth?: PivotItem<T>['minWidth']
  width?: PivotItem<T>['width']
  _label: string
}

export type IPivotTransformWorkerFilter<T extends IItem = IItem> = {
  field: ObjectKey<T>
  dataType: ExtendedDataType
  comparator: ComparatorEnum
  filterValue?: any
}

export type IPivotTransformWorkerPayload<T extends IItem = IItem> = {
  data: T[]
  rows: IPivotTransformWorkerRow<T>[]
  columns: IPivotTransformWorkerColumn<T>[]
  values: IPivotTransformWorkerValue<T>[]
  filters?: IPivotTransformWorkerFilter<T>[]
  locale?: string
}

function resolvePivotLabel<T extends IItem>(payload: {
  label: PivotItem<T>['label']
  field: ObjectKey<T>
  context: PivotItem<T>
}) {
  const { label, field, context } = payload

  if (typeof label === 'function') {
    return label(context)
  }

  return label ?? String(field)
}

function serializePivotRow<T extends IItem>(row: IPivotTransformRowField<T>): IPivotTransformWorkerRow<T> {
  const raw = toRaw(row)

  return {
    field: raw.field,
    dataType: raw.dataType,
    minWidth: raw.minWidth,
    width: raw.width,
    widthResolved: raw.widthResolved,
    resizable: raw.resizable,
  }
}

function serializePivotColumn<T extends IItem>(column: IPivotTransformColumnField<T>): IPivotTransformWorkerColumn<T> {
  const raw = toRaw(column) as IPivotTransformColumnField<T> & Partial<PivotItem<T>>

  return {
    field: raw.field,
    minWidth: raw.minWidth,
    width: raw.width,
    widthResolved: raw.widthResolved,
    _label: raw._label ?? resolvePivotLabel({ label: raw.label, field: raw.field, context: raw as PivotItem<T> }),
  }
}

function serializePivotValue<T extends IItem>(value: IPivotTransformValueField<T>): IPivotTransformWorkerValue<T> {
  const raw = toRaw(value) as IPivotTransformValueField<T> & Partial<PivotItem<T>>

  return {
    field: raw.field,
    summaryType: raw.summaryType,
    dataType: raw.dataType,
    minWidth: raw.minWidth,
    width: raw.width,
    widthResolved: raw.widthResolved,
    _label: raw._label,
  }
}

function serializePivotFilters<T extends IItem>(items: PivotItem<T>[] = []) {
  return getActivePivotFilterItems(items).map(filter => ({
    field: filter.field,
    dataType: filter.dataType,
    comparator: filter.comparator,
    filterValue: filter.value,
  } satisfies IPivotTransformWorkerFilter<T>))
}

export function serializePivotTransformWorkerPayload<T extends IItem>(
  payload: IPivotTransformCorePayload<T>,
): IPivotTransformWorkerPayload<T> {
  return {
    data: klona(toRaw(payload.data)),
    rows: toRaw(payload.rows).map(serializePivotRow),
    columns: toRaw(payload.columns).map(serializePivotColumn),
    values: toRaw(payload.values).map(serializePivotValue),
    filters: serializePivotFilters(payload.items),
    locale: payload.locale,
  }
}

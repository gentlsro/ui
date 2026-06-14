import { klona } from 'klona/full'
import { toRaw } from 'vue'

// Models
import type { PivotRow } from '../models/pivot-row.model'
import type { PivotColumn } from '../models/pivot-column.model'
import type { PivotValue } from '../models/pivot-value.model'

import type { IPivotTransformCorePayload } from './pivot-transform-data-core'

export type IPivotTransformWorkerRow<T = IItem> = Pick<
  PivotRow<T>,
  'field' | 'dataType' | 'minWidth' | 'width' | 'widthResolved' | 'resizable'
>

export type IPivotTransformWorkerColumn<T = IItem> = Pick<
  PivotColumn<T>,
  'field' | 'minWidth' | 'width' | 'widthResolved'
> & {
  _label: string
}

export type IPivotTransformWorkerValue<T = IItem> = Pick<
  PivotValue<T>,
  'field' | 'summaryType' | 'dataType' | 'minWidth' | 'width' | 'widthResolved'
> & {
  _label: string
}

export type IPivotTransformWorkerPayload<T = IItem> = {
  data: T[]
  rows: IPivotTransformWorkerRow<T>[]
  columns: IPivotTransformWorkerColumn<T>[]
  values: IPivotTransformWorkerValue<T>[]
  locale?: string
}

function resolvePivotLabel<T>(
  label: string | ((value: T) => string) | undefined,
  field: ObjectKey<IItem>,
  context: T,
) {
  if (typeof label === 'function') {
    return label(context)
  }

  return label ?? String(field)
}

function serializePivotRow<T>(row: PivotRow<T>): IPivotTransformWorkerRow<T> {
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

function serializePivotColumn<T>(column: PivotColumn<T>): IPivotTransformWorkerColumn<T> {
  const raw = toRaw(column)

  return {
    field: raw.field,
    minWidth: raw.minWidth,
    width: raw.width,
    widthResolved: raw.widthResolved,
    _label: resolvePivotLabel(raw.label, raw.field, raw),
  }
}

function serializePivotValue<T>(value: PivotValue<T>): IPivotTransformWorkerValue<T> {
  const raw = toRaw(value)

  return {
    field: raw.field,
    summaryType: raw.summaryType,
    dataType: raw.dataType,
    minWidth: raw.minWidth,
    width: raw.width,
    widthResolved: raw.widthResolved,
    _label: resolvePivotLabel(raw.label, raw.field, raw),
  }
}

export function serializePivotTransformWorkerPayload<T>(
  payload: IPivotTransformCorePayload<T>,
): IPivotTransformWorkerPayload<T> {
  return {
    data: klona(toRaw(payload.data)),
    rows: toRaw(payload.rows).map(serializePivotRow),
    columns: toRaw(payload.columns).map(serializePivotColumn),
    values: toRaw(payload.values).map(serializePivotValue),
    locale: payload.locale,
  }
}

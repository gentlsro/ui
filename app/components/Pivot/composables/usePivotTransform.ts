// Types
import type { IPivotProps } from '../types/pivot-props.type'
import type { IPivotState } from '../types/pivot-state.type'
import type { IPivotTransformResult } from '../types/pivot-transform-result.type'

// Functions
import { getInitialCollapsedGroupIds } from '../functions/pivot-group-collapse'
import { getInitialCollapsedColumnGroupIds } from '../functions/pivot-column-collapse'
import {
  pivotTransformDataCore,
  rehydratePivotTransformResult,
  type IPivotTransformValueField,
} from '../functions/pivot-transform-data-core'
import { shouldUsePivotTransformWorker } from '../functions/pivot-transform-complexity'
import { serializePivotTransformWorkerPayload } from '../functions/pivot-transform-worker-payload'
import { pivotTransformData } from '../functions/pivot-transform-data'

// Models
import type { PivotItem } from '../models/pivot-item.model'

import type { IPivotTransformWorkerPayload } from '../functions/pivot-transform-worker-payload'

import PivotTransformWorker from '../workers/pivot-transform.worker?worker'

type IPivotFormatNumber = (value: number) => string

type IPivotTransformPayload<T extends IItem = IItem> = {
  data: T[]
  rows: PivotItem<T>[]
  columns: PivotItem<T>[]
  values: IPivotTransformValueField<T>[]
  items?: PivotItem<T>[]
  state: IPivotState
  collapseConfig: IPivotProps<T>['collapseConfig']
  isFirstRender?: Ref<boolean>
  formatNumber: IPivotFormatNumber
  locale?: string
  useWorker?: boolean
}

function applyPivotTransformState<T extends IItem>(
  payload: IPivotTransformPayload<T>,
  result: IPivotTransformResult<T>,
) {
  const {
    rows: rowFields,
    columns: columnFields,
    state,
    collapseConfig,
    isFirstRender = ref(true),
  } = payload

  if (isFirstRender.value) {
    state.collapsedGroupIds = getInitialCollapsedGroupIds({
      data: result.data,
      expandedLevelOnInit: collapseConfig?.expandedLevelOnInit ?? 0,
      rowFieldCount: rowFields.length,
    })
    state.collapsedColumnGroupIds = getInitialCollapsedColumnGroupIds({
      tree: result.columnTree,
      expandedLevelOnInit: collapseConfig?.expandedLevelOnInit ?? 0,
      columnFieldCount: columnFields.length,
    })
    isFirstRender.value = false
  }
}

function toWorkerPayload<T extends IItem>(payload: IPivotTransformPayload<T>): IPivotTransformWorkerPayload<T> {
  return serializePivotTransformWorkerPayload({
    data: payload.data,
    rows: payload.rows,
    columns: payload.columns,
    values: payload.values,
    items: payload.items,
    locale: payload.locale,
  })
}

export function usePivotTransform() {
  let worker: Worker | undefined
  let workerStatus: 'PENDING' | 'SUCCESS' | 'RUNNING' | 'ERROR' | 'TIMEOUT_EXPIRED' = 'PENDING'

  const workerTerminate = (status: typeof workerStatus = 'PENDING') => {
    worker?.terminate()
    worker = undefined
    workerStatus = status
  }

  tryOnScopeDispose(workerTerminate)

  const workerFn = <T extends IItem>(payload: IPivotTransformWorkerPayload<T>) => {
    if (workerStatus === 'RUNNING') {
      console.error('[usePivotTransform] You can only run one instance of the worker at a time.')

      return Promise.reject(new Error('Pivot transform worker already running'))
    }

    return new Promise<IPivotTransformResult<T>>((resolve, reject) => {
      worker = new PivotTransformWorker()
      workerStatus = 'RUNNING'

      worker.onmessage = (event: MessageEvent<[string, IPivotTransformResult<T> | string]>) => {
        const [status, result] = event.data

        if (status === 'SUCCESS') {
          workerTerminate('SUCCESS')
          resolve(result as IPivotTransformResult<T>)
        } else {
          workerTerminate('ERROR')
          reject(new Error(String(result)))
        }
      }

      worker.onerror = event => {
        event.preventDefault()
        workerTerminate('ERROR')
        reject(event.error ?? new Error('Pivot transform worker failed'))
      }

      worker.postMessage(payload)
    })
  }

  const transformPivotData = async <T extends IItem>(
    payload: IPivotTransformPayload<T>,
  ): Promise<IPivotTransformResult<T>> => {
    const useWorker = payload.useWorker ?? shouldUsePivotTransformWorker({
      dataCount: payload.data.length,
      rowCount: payload.rows.length,
      columnCount: payload.columns.length,
      valueCount: payload.values.length,
      hasSummaryFormat: payload.values.some(value => !!value.summaryFormat),
    })

    if (!useWorker) {
      return pivotTransformData(payload)
    }

    workerTerminate()

    await nextTick()

    const coreResult = await workerFn(toWorkerPayload(payload))

    const result = rehydratePivotTransformResult(coreResult, {
      rows: payload.rows,
      values: payload.values,
    })

    applyPivotTransformState(payload, result)

    return result
  }

  return {
    transformPivotData,
    pivotTransformDataCore,
    workerTerminate,
  }
}

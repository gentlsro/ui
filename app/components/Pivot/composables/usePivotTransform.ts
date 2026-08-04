// Types
import type { IPivotPerformanceConfig } from '../constants/pivot-performance.constant'
import type { IPivotProps } from '../types/pivot-props.type'
import type { IPivotState } from '../types/pivot-state.type'
import type { IPivotTransformResult } from '../types/pivot-transform-result.type'
import type { IPivotTransformEstimate } from '../types/pivot-transform-estimate.type'
import type {
  IPivotTransformWorkerRequest,
  IPivotTransformWorkerResponse,
} from '../types/pivot-transform-worker-message.type'
import type {
  IPivotPreparedAggregation,
  IPivotTransformValueField,
} from '../functions/pivot-transform-data-core'

// Functions
import {
  materializePivotTransformData,
  pivotTransformDataCore,
  preparePivotAggregationData,
  projectPivotPreparedAggregation,
  rehydratePivotTransformResult,
} from '../functions/pivot-transform-data-core'
import { getInitialCollapsedGroupIds } from '../functions/pivot-group-collapse'
import { getInitialCollapsedColumnGroupIds } from '../functions/pivot-column-collapse'
import { isPivotPerformanceOverBudget } from '../constants/pivot-performance.constant'
import { shouldUsePivotTransformWorker } from '../functions/pivot-transform-complexity'
import { serializePivotTransformWorkerPayload } from '../functions/pivot-transform-worker-payload'
import { pivotTransformData } from '../functions/pivot-transform-data'
import { applyPivotDataFilters } from '../functions/pivot-apply-data-filters'

// Models
import type { PivotItem } from '../models/pivot-item.model'

import PivotTransformWorker from '../workers/pivot-transform.worker?worker'

type IPivotFormatNumber = (value: number) => string

export type IPivotTransformPayload<T extends IItem = IItem> = {
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
  valuesOnRows?: boolean
  useWorker?: boolean
  performance?: IPivotPerformanceConfig
  onPerformanceWarning?: (estimate: IPivotTransformEstimate) => void
  aggregationKey?: string
}

type IActiveWorkerJob<T extends IItem = IItem> = {
  id: number
  resolve: (result: IPivotTransformResult<T>) => void
  reject: (error: Error) => void
  onPerformanceWarning?: (estimate: IPivotTransformEstimate) => void
}

type IMainThreadDecision = {
  resolve: () => void
  reject: (error: Error) => void
}

function createPivotAbortError(message = 'Pivot transform was superseded.') {
  return new DOMException(message, 'AbortError')
}

function isPivotDataCloneError(error: unknown) {
  return !!error
    && typeof error === 'object'
    && 'name' in error
    && error.name === 'DataCloneError'
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

  if (isFirstRender.value && result.data.length > 0) {
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

export function usePivotTransform() {
  let worker: Worker | undefined
  let workerData: IItem[] | undefined
  let dataVersion = 0
  let jobSequence = 0
  let activeWorkerJob: IActiveWorkerJob | undefined
  let mainThreadDecision: IMainThreadDecision | undefined
  let mainThreadPrepared: {
    key: string
    sourceData: IItem[]
    prepared: unknown
  } | undefined

  function rejectActiveWorkerJob(error: Error) {
    activeWorkerJob?.reject(error)
    activeWorkerJob = undefined
  }

  function workerTerminate(
    error: Error = createPivotAbortError('Pivot transform worker was terminated.'),
  ) {
    rejectActiveWorkerJob(error)
    worker?.terminate()
    worker = undefined
    workerData = undefined
  }

  function cancelTransform(message = 'Pivot transform was cancelled.') {
    const error = createPivotAbortError(message)

    mainThreadDecision?.reject(error)
    mainThreadDecision = undefined

    if (activeWorkerJob) {
      const request: IPivotTransformWorkerRequest = {
        type: 'CANCEL',
        jobId: activeWorkerJob.id,
      }

      try {
        worker?.postMessage(request)
      } finally {
        workerTerminate(error)
      }
    }
  }

  function continueTransform() {
    if (mainThreadDecision) {
      mainThreadDecision.resolve()
      mainThreadDecision = undefined

      return
    }

    if (activeWorkerJob) {
      const request: IPivotTransformWorkerRequest = {
        type: 'CONTINUE',
        jobId: activeWorkerJob.id,
      }

      try {
        worker?.postMessage(request)
      } catch (error) {
        workerTerminate(error instanceof Error ? error : new Error(String(error)))
      }
    }
  }

  function initWorker() {
    if (worker) {
      return worker
    }

    worker = new PivotTransformWorker()

    worker.onmessage = (event: MessageEvent<IPivotTransformWorkerResponse>) => {
      const response = event.data
      const activeJob = activeWorkerJob

      if (!activeJob || response.jobId !== activeJob.id) {
        return
      }

      if (response.type === 'WARNING') {
        activeJob.onPerformanceWarning?.(response.estimate)

        return
      }

      activeWorkerJob = undefined

      if (response.type === 'SUCCESS') {
        activeJob.resolve(response.result)

        return
      }

      if (response.type === 'CANCELLED') {
        activeJob.reject(createPivotAbortError())

        return
      }

      activeJob.reject(new Error(response.message))
    }

    worker.onerror = event => {
      event.preventDefault()
      workerTerminate(event.error ?? new Error('Pivot transform worker failed.'))
    }

    return worker
  }

  function syncWorkerData<T extends IItem>(nextWorker: Worker, data: T[]) {
    const rawData = toRaw(data)

    if (workerData === rawData) {
      return
    }

    dataVersion += 1
    workerData = rawData

    const request: IPivotTransformWorkerRequest<T> = {
      type: 'SET_DATA',
      dataVersion,
      data: rawData,
    }

    try {
      nextWorker.postMessage(request)
    } catch (error) {
      workerData = undefined
      throw error
    }
  }

  function runWorkerTransform<T extends IItem>(payload: IPivotTransformPayload<T>) {
    if (activeWorkerJob) {
      workerTerminate(createPivotAbortError())
    }

    const nextWorker = initWorker()
    const serialized = serializePivotTransformWorkerPayload(payload)
    const { data, ...workerPayload } = serialized

    syncWorkerData(nextWorker, data)
    jobSequence += 1

    return new Promise<IPivotTransformResult<T>>((resolve, reject) => {
      activeWorkerJob = {
        id: jobSequence,
        resolve: resolve as IActiveWorkerJob['resolve'],
        reject,
        onPerformanceWarning: payload.onPerformanceWarning,
      }

      const request: IPivotTransformWorkerRequest<T> = {
        type: 'TRANSFORM',
        jobId: jobSequence,
        dataVersion,
        aggregationKey: payload.aggregationKey,
        payload: workerPayload,
        performance: payload.performance,
      }

      try {
        nextWorker.postMessage(request)
      } catch (error) {
        activeWorkerJob = undefined
        reject(error instanceof Error ? error : new Error(String(error)))
      }
    })
  }

  async function waitForMainThreadConfirmation<T extends IItem>(
    payload: IPivotTransformPayload<T>,
    estimate: IPivotTransformEstimate,
  ) {
    payload.onPerformanceWarning?.(estimate)

    await new Promise<void>((resolve, reject) => {
      mainThreadDecision = { resolve, reject }
    })
  }

  async function runMainThreadTransform<T extends IItem>(payload: IPivotTransformPayload<T>) {
    const sourceData = toRaw(payload.data)
    const cached = payload.aggregationKey
      && mainThreadPrepared?.key === payload.aggregationKey
      && mainThreadPrepared.sourceData === sourceData
      ? mainThreadPrepared.prepared as IPivotPreparedAggregation<T>
      : undefined
    const preparedAggregation = cached ?? preparePivotAggregationData({
      ...payload,
      data: payload.items?.length
        ? applyPivotDataFilters(payload.data, payload.items)
        : payload.data,
      sourceRowCount: payload.data.length,
    })

    if (payload.aggregationKey && !cached) {
      mainThreadPrepared = {
        key: payload.aggregationKey,
        sourceData,
        prepared: preparedAggregation,
      }
    }

    const prepared = projectPivotPreparedAggregation(preparedAggregation, {
      rows: payload.rows,
      columns: payload.columns,
      values: payload.values,
      valuesOnRows: payload.valuesOnRows,
    })

    if (isPivotPerformanceOverBudget(prepared.estimate, payload.performance)) {
      await waitForMainThreadConfirmation(payload, prepared.estimate)
    }

    return materializePivotTransformData(prepared)
  }

  const transformPivotData = async <T extends IItem>(
    payload: IPivotTransformPayload<T>,
  ): Promise<IPivotTransformResult<T>> => {
    cancelTransform('Pivot transform was superseded.')

    const useWorker = payload.useWorker ?? shouldUsePivotTransformWorker({
      dataCount: payload.data.length,
      rowCount: payload.rows.length,
      columnCount: payload.columns.length,
      valueCount: payload.values.length,
      hasSummaryFormat: payload.values.some(value => !!value.summaryFormat),
    })

    let usedWorker = useWorker
    let coreResult: IPivotTransformResult<T>

    if (usedWorker) {
      try {
        coreResult = await runWorkerTransform(payload)
      } catch (error) {
        if (!isPivotDataCloneError(error)) {
          throw error
        }

        workerTerminate()
        usedWorker = false
        coreResult = await runMainThreadTransform(payload)
      }
    } else {
      coreResult = await runMainThreadTransform(payload)
    }

    const result = usedWorker
      ? rehydratePivotTransformResult(coreResult, {
          rows: payload.rows,
          values: payload.values,
        })
      : coreResult

    applyPivotTransformState(payload, result)

    return result
  }

  tryOnScopeDispose(() => {
    workerTerminate()
    mainThreadDecision?.reject(createPivotAbortError('Pivot transform was disposed.'))
    mainThreadDecision = undefined
    mainThreadPrepared = undefined
  })

  return {
    transformPivotData,
    pivotTransformData,
    pivotTransformDataCore,
    continueTransform,
    cancelTransform,
    workerTerminate,
  }
}

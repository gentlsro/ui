/// <reference lib="webworker" />

import type {
  IPivotPreparedAggregation,
  IPivotPreparedTransform,
} from '../functions/pivot-transform-data-core'
import type {
  IPivotTransformWorkerRequest,
  IPivotTransformWorkerResponse,
} from '../types/pivot-transform-worker-message.type'

import { isPivotPerformanceOverBudget } from '../constants/pivot-performance.constant'
import {
  materializePivotTransformData,
  preparePivotAggregationData,
  projectPivotPreparedAggregation,
} from '../functions/pivot-transform-data-core'

declare const self: DedicatedWorkerGlobalScope

let sourceData: IItem[] = []
let dataVersion = 0
let preparedAggregation: {
  key: string
  dataVersion: number
  prepared: IPivotPreparedAggregation
} | undefined
let preparedJob: {
  jobId: number
  prepared: IPivotPreparedTransform
} | undefined

function postResponse(response: IPivotTransformWorkerResponse) {
  self.postMessage(response)
}

self.onmessage = (event: MessageEvent<IPivotTransformWorkerRequest>) => {
  const request = event.data

  try {
    if (request.type === 'SET_DATA') {
      sourceData = request.data
      dataVersion = request.dataVersion
      preparedAggregation = undefined
      preparedJob = undefined

      return
    }

    if (request.type === 'CANCEL') {
      if (preparedJob?.jobId === request.jobId) {
        preparedJob = undefined
      }

      postResponse({ type: 'CANCELLED', jobId: request.jobId })

      return
    }

    if (request.type === 'CONTINUE') {
      if (!preparedJob || preparedJob.jobId !== request.jobId) {
        postResponse({
          type: 'ERROR',
          jobId: request.jobId,
          message: 'The prepared Pivot transform is no longer available.',
        })

        return
      }

      const result = materializePivotTransformData(preparedJob.prepared)

      preparedJob = undefined
      postResponse({ type: 'SUCCESS', jobId: request.jobId, result })

      return
    }

    if (request.dataVersion !== dataVersion) {
      postResponse({
        type: 'ERROR',
        jobId: request.jobId,
        message: 'Pivot source data changed before the transform started.',
      })

      return
    }

    const cached = request.aggregationKey
      && preparedAggregation?.key === request.aggregationKey
      && preparedAggregation.dataVersion === request.dataVersion
      ? preparedAggregation.prepared
      : undefined
    const aggregation = cached ?? preparePivotAggregationData({
      ...request.payload,
      data: sourceData,
    })

    if (request.aggregationKey && !cached) {
      preparedAggregation = {
        key: request.aggregationKey,
        dataVersion: request.dataVersion,
        prepared: aggregation,
      }
    }

    const prepared = projectPivotPreparedAggregation(aggregation, {
      rows: request.payload.rows,
      columns: request.payload.columns,
      values: request.payload.values,
      valuesOnRows: request.payload.valuesOnRows,
    })

    if (isPivotPerformanceOverBudget(prepared.estimate, request.performance)) {
      preparedJob = { jobId: request.jobId, prepared }
      postResponse({ type: 'WARNING', jobId: request.jobId, estimate: prepared.estimate })

      return
    }

    postResponse({
      type: 'SUCCESS',
      jobId: request.jobId,
      result: materializePivotTransformData(prepared),
    })
  } catch (error) {
    const jobId = 'jobId' in request ? request.jobId : 0

    preparedJob = undefined
    postResponse({
      type: 'ERROR',
      jobId,
      message: error instanceof Error ? error.message : String(error),
    })
  }
}

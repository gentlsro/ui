import type { IPivotPerformanceConfig } from '../constants/pivot-performance.constant'
import type { IPivotTransformEstimate } from './pivot-transform-estimate.type'
import type { IPivotTransformWorkerPayload } from '../functions/pivot-transform-worker-payload'
import type { IPivotTransformResult } from './pivot-transform-result.type'

export type IPivotTransformWorkerRequest<T extends IItem = IItem>
  = | {
    type: 'SET_DATA'
    dataVersion: number
    data: T[]
  }
  | {
    type: 'TRANSFORM'
    jobId: number
    dataVersion: number
    aggregationKey?: string
    payload: Omit<IPivotTransformWorkerPayload<T>, 'data'>
    performance?: IPivotPerformanceConfig
  }
  | {
    type: 'CONTINUE'
    jobId: number
  }
  | {
    type: 'CANCEL'
    jobId: number
  }

export type IPivotTransformWorkerResponse<T extends IItem = IItem>
  = | {
    type: 'WARNING'
    jobId: number
    estimate: IPivotTransformEstimate
  }
  | {
    type: 'SUCCESS'
    jobId: number
    result: IPivotTransformResult<T>
  }
  | {
    type: 'CANCELLED'
    jobId: number
  }
  | {
    type: 'ERROR'
    jobId: number
    message: string
  }

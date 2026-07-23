/// <reference lib="webworker" />

import type { IPivotTransformWorkerPayload } from '../functions/pivot-transform-worker-payload'
import { pivotTransformDataCore } from '../functions/pivot-transform-data-core'

declare const self: DedicatedWorkerGlobalScope

self.onmessage = (event: MessageEvent<IPivotTransformWorkerPayload>) => {
  try {
    const result = pivotTransformDataCore(event.data)
    self.postMessage(['SUCCESS', result])
  } catch (error) {
    self.postMessage([
      'ERROR',
      error instanceof Error ? error.message : String(error),
    ])
  }
}

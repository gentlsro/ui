import type * as PivotTransformComposable from './usePivotTransform'
import { ref, toRaw } from 'vue'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  disposers: [] as Array<() => void>,
  workers: [] as any[],
}))

vi.mock('../workers/pivot-transform.worker?worker', () => ({
  default: class FakePivotWorker {
    onerror?: (event: any) => void
    onmessage?: (event: any) => void
    messages: any[] = []
    terminated = false

    constructor() {
      mocks.workers.push(this)
    }

    postMessage(message: any) {
      this.messages.push(message)
    }

    terminate() {
      this.terminated = true
    }

    respond(message: any) {
      this.onmessage?.({ data: message })
    }

    fail(error: Error) {
      this.onerror?.({ error, preventDefault: vi.fn() })
    }
  },
}))

const summary = {
  SUM: 'SUM' as SummaryEnum,
  COUNT: 'COUNT' as SummaryEnum,
  AVERAGE: 'AVERAGE' as SummaryEnum,
  MEDIAN: 'MEDIAN' as SummaryEnum,
}

const emptyResult = {
  data: [],
  valueColumns: [],
  valueHeaderRows: [],
  columnTree: [],
  stickyIndices: [],
  estimate: {
    sourceRowCount: 1,
    projectedRowCount: 0,
    valueColumnCount: 0,
    logicalCellCount: 0,
  },
}

let usePivotTransform: typeof PivotTransformComposable.usePivotTransform

beforeAll(async () => {
  vi.stubGlobal('SummaryEnum', summary)
  vi.stubGlobal('Worker', class {})
  vi.stubGlobal('toRaw', toRaw)
  vi.stubGlobal('tryOnScopeDispose', (dispose: () => void) => mocks.disposers.push(dispose))
  vi.stubGlobal('useRuntimeConfig', () => ({ public: { transliterate: false } }))
  usePivotTransform = (await import('./usePivotTransform')).usePivotTransform
})

beforeEach(() => {
  mocks.disposers = []
  mocks.workers = []
})

function createPayload(data = [{ group: 'A', amount: 1 }]) {
  return {
    data,
    rows: [{
      field: 'group',
      dataType: 'string',
      minWidth: 100,
      width: '100px',
      widthResolved: '100px',
      resizable: true,
    }],
    columns: [],
    values: [{
      measureId: 'amount-sum',
      field: 'amount',
      summaryType: summary.SUM,
      widthResolved: '80px',
      _label: 'Amount',
    }],
    state: {
      collapsedGroupIds: new Set<string>(),
      collapsedColumnGroupIds: new Set<string>(),
    },
    collapseConfig: undefined,
    isFirstRender: ref(false),
    formatNumber: String,
    useWorker: true,
    aggregationKey: 'source-1:aggregation-1',
  } as any
}

function getTransformMessage(worker: any) {
  return worker.messages.find((message: any) => message.type === 'TRANSFORM')
}

describe('pivot transform job lifecycle', () => {
  it('rejects a superseded job and ignores its stale result', async () => {
    const transform = usePivotTransform()
    const first = transform.transformPivotData(createPayload())
    const firstOutcome = first.catch(error => error)
    const firstWorker = mocks.workers[0]
    const second = transform.transformPivotData(createPayload())
    const secondWorker = mocks.workers[1]
    const secondJob = getTransformMessage(secondWorker)

    firstWorker.respond({ type: 'SUCCESS', jobId: getTransformMessage(firstWorker).jobId, result: emptyResult })
    secondWorker.respond({ type: 'SUCCESS', jobId: secondJob.jobId, result: emptyResult })

    await expect(firstOutcome).resolves.toMatchObject({ name: 'AbortError' })
    await expect(second).resolves.toMatchObject({ data: [] })
    expect(firstWorker.terminated).toBe(true)
  })

  it('keeps a warned job pending and resumes the prepared job', async () => {
    const transform = usePivotTransform()
    const onPerformanceWarning = vi.fn()
    const result = transform.transformPivotData({
      ...createPayload(),
      onPerformanceWarning,
    })
    const worker = mocks.workers[0]
    const job = getTransformMessage(worker)

    worker.respond({
      type: 'WARNING',
      jobId: job.jobId,
      estimate: { ...emptyResult.estimate, logicalCellCount: 300_000 },
    })

    expect(onPerformanceWarning).toHaveBeenCalledOnce()
    transform.continueTransform()
    expect(worker.messages.at(-1)).toEqual({ type: 'CONTINUE', jobId: job.jobId })

    worker.respond({ type: 'SUCCESS', jobId: job.jobId, result: emptyResult })
    await expect(result).resolves.toMatchObject({ data: [] })
  })

  it('settles cancellation, worker failure, and disposal', async () => {
    const cancelledTransform = usePivotTransform()
    const cancelled = cancelledTransform.transformPivotData(createPayload())

    cancelledTransform.cancelTransform()
    await expect(cancelled).rejects.toMatchObject({ name: 'AbortError' })

    const failedTransform = usePivotTransform()
    const failed = failedTransform.transformPivotData(createPayload())

    mocks.workers.at(-1).fail(new Error('worker failed'))
    await expect(failed).rejects.toThrow('worker failed')

    const disposedTransform = usePivotTransform()
    const disposed = disposedTransform.transformPivotData(createPayload())

    mocks.disposers.at(-1)!()
    await expect(disposed).rejects.toMatchObject({ name: 'AbortError' })
  })

  it('sends the source snapshot once for configuration-only jobs', async () => {
    const transform = usePivotTransform()
    const data = [{ group: 'A', amount: 1 }]
    const first = transform.transformPivotData(createPayload(data))
    const worker = mocks.workers[0]
    const firstJob = getTransformMessage(worker)

    worker.respond({ type: 'SUCCESS', jobId: firstJob.jobId, result: emptyResult })
    await first

    const second = transform.transformPivotData({
      ...createPayload(data),
      valuesOnRows: true,
    })
    const secondJob = worker.messages.filter((message: any) => message.type === 'TRANSFORM').at(-1)

    worker.respond({ type: 'SUCCESS', jobId: secondJob.jobId, result: emptyResult })
    await second

    expect(worker.messages.filter((message: any) => message.type === 'SET_DATA')).toHaveLength(1)
  })
})

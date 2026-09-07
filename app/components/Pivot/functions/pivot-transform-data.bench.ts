import { test, vi } from 'vitest'

const summary = {
  SUM: 'SUM' as SummaryEnum,
  COUNT: 'COUNT' as SummaryEnum,
  AVERAGE: 'AVERAGE' as SummaryEnum,
  MEDIAN: 'MEDIAN' as SummaryEnum,
}

vi.stubGlobal('SummaryEnum', summary)

const {
  pivotTransformDataCore,
  preparePivotTransformData,
} = await import('./pivot-transform-data-core')

const rows = [{
  field: 'group' as const,
  dataType: 'string' as const,
  minWidth: 100,
  width: '120px',
  widthResolved: '120px',
  resizable: true,
}]
const columns = [{ field: 'period' as const }]
const values = [
  {
    measureId: 'amount-sum',
    field: 'amount' as const,
    summaryType: summary.SUM,
    widthResolved: '80px',
    _label: 'Amount',
  },
  {
    measureId: 'amount-count',
    field: 'amount' as const,
    summaryType: summary.COUNT,
    widthResolved: '80px',
    _label: 'Count',
  },
]

const moderateData = Array.from({ length: 100_000 }, (_, index) => ({
  group: `group-${index % 100}`,
  period: `period-${index % 12}`,
  amount: index % 1_000,
}))

const highCardinalityData = Array.from({ length: 100_000 }, (_, index) => ({
  group: `group-${index % 500}`,
  period: `period-${index % 499}`,
  amount: index % 1_000,
}))

const pathologicalData = Array.from({ length: 10_000 }, (_, index) => ({
  group: `unique-group-${index}`,
  period: `unique-period-${index}`,
  amount: index,
}))

test('100k source rows, moderate cardinality', async ({ bench }) => {
  await bench('transform', () => {
    pivotTransformDataCore({ data: moderateData, rows, columns, values })
  }).run({ iterations: 5, warmupIterations: 1 })
})

test('100k source rows, approximately 250k logical cells', async ({ bench }) => {
  await bench('transform', () => {
    pivotTransformDataCore({ data: highCardinalityData, rows, columns, values: [values[0]!] })
  }).run({ iterations: 5, warmupIterations: 1 })
})

test('100k source rows, values projected on rows', async ({ bench }) => {
  await bench('transform', () => {
    pivotTransformDataCore({
      data: moderateData,
      rows,
      columns,
      values,
      valuesOnRows: true,
    })
  }).run({ iterations: 5, warmupIterations: 1 })
})

test('unique row by unique column warning preparation', async ({ bench }) => {
  await bench('prepare', () => {
    const prepared = preparePivotTransformData({
      data: pathologicalData,
      rows,
      columns,
      values: [values[0]!],
    })

    if (prepared.estimate.logicalCellCount < 100_000_000) {
      throw new Error('Pathological case did not exceed its expected output cardinality.')
    }
  }).run({ iterations: 5, warmupIterations: 1 })
})

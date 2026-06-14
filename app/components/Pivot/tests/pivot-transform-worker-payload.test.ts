import { describe, expect, it, vi } from 'vitest'
import { reactive } from 'vue'
import { ComparatorEnum } from '$comparatorEnum'
import { SummaryEnum } from '#layers/utilities/shared/enums/summary.enum'
import { PivotItem } from '../models/pivot-item.model'
import { resolvePivotValueField } from '../functions/pivot-item-usage'
import { serializePivotTransformWorkerPayload } from '../functions/pivot-transform-worker-payload'

type IWorkerPayloadTestItem = {
  region: string
  date?: Date
  revenue: number
  year?: string
}

describe('serializePivotTransformWorkerPayload', () => {
  it('produces a structured-cloneable payload from reactive pivot config', () => {
    vi.stubGlobal('Worker', class Worker {})

    const data = reactive<IWorkerPayloadTestItem[]>([
      {
        region: 'North',
        date: new Date('2024-01-01'),
        revenue: 100,
      },
    ])

    const rows = [
      new PivotItem<IWorkerPayloadTestItem>({ field: 'region', dataType: 'string' }),
    ]

    const columns = [
      new PivotItem<IWorkerPayloadTestItem>({ field: 'year', label: 'Year' }),
    ]

    const revenueItem = new PivotItem<IWorkerPayloadTestItem>({ field: 'revenue', label: 'Revenue' })

    const values = [
      resolvePivotValueField(revenueItem, { index: 0, summaryType: SummaryEnum.SUM }),
    ]

    const payload = serializePivotTransformWorkerPayload({
      data,
      rows,
      columns,
      values,
      locale: 'en-US',
    })

    expect(() => structuredClone(payload)).not.toThrow()
    expect(payload.rows[0]?.field).toBe('region')
    expect(payload.columns[0]?._label).toBe('Year')
    expect(payload.values[0]?._label).toBe('Revenue')
    expect(payload.data[0]?.date).toEqual(new Date('2024-01-01'))
  })

  it('serializes active pivot filters into structured-cloneable payload', () => {
    const data: IWorkerPayloadTestItem[] = [
      { region: 'North', revenue: 100 },
      { region: 'South', revenue: 75 },
    ]

    const items = [
      new PivotItem<IWorkerPayloadTestItem>({
        field: 'region',
        dataType: 'string',
        usage: {
          filter: [{
            index: 0,
            comparator: ComparatorEnum.EQUAL,
            filterValue: 'North',
          }],
        },
      }),
    ]

    const payload = serializePivotTransformWorkerPayload({
      data,
      rows: [new PivotItem<IWorkerPayloadTestItem>({ field: 'region', dataType: 'string' })],
      columns: [],
      values: [resolvePivotValueField(
        new PivotItem<IWorkerPayloadTestItem>({ field: 'revenue' }),
        { index: 0, summaryType: SummaryEnum.SUM },
      )],
      items,
    })

    expect(() => structuredClone(payload)).not.toThrow()
    expect(payload.filters).toEqual([{
      field: 'region',
      dataType: 'string',
      comparator: ComparatorEnum.EQUAL,
      filterValue: 'North',
    }])
    expect(payload.data).toHaveLength(2)
  })
})

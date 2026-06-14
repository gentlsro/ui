import { describe, expect, it, vi } from 'vitest'
import { reactive } from 'vue'
import { SummaryEnum } from '#layers/utilities/shared/enums/summary.enum'
import { PivotColumn } from '../models/pivot-column.model'
import { PivotRow } from '../models/pivot-row.model'
import { PivotValue } from '../models/pivot-value.model'
import { serializePivotTransformWorkerPayload } from '../functions/pivot-transform-worker-payload'

describe('serializePivotTransformWorkerPayload', () => {
  it('produces a structured-cloneable payload from reactive pivot config', () => {
    vi.stubGlobal('Worker', class Worker {})

    const data = reactive([
      {
        region: 'North',
        date: new Date('2024-01-01'),
        revenue: 100,
      },
    ])

    const rows = [
      new PivotRow({ field: 'region', dataType: 'string' }),
    ]

    const columns = [
      new PivotColumn({ field: 'year', label: 'Year' }),
    ]

    const values = [
      new PivotValue({ field: 'revenue', summaryType: SummaryEnum.SUM, label: 'Revenue' }),
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
})

import { describe, expect, it } from 'vitest'
import { normalizePivotMeasureIds, resolvePivotMeasureId } from './pivot-measure-id'

describe('pivot measure identity', () => {
  it('normalizes legacy slots deterministically and keeps explicit ids', () => {
    const items = [{
      field: 'amount',
      usage: {
        value: [
          { index: 0, summaryType: 'SUM' },
          { id: 'saved-count', index: 1, summaryType: 'COUNT' },
        ],
      },
    }]

    normalizePivotMeasureIds(items as never)

    expect(items[0]!.usage.value[0]!.id).toBe('pivot-measure:amount:0')
    expect(items[0]!.usage.value[1]!.id).toBe('saved-count')
    expect(resolvePivotMeasureId('amount', items[0]!.usage.value[0]! as never))
      .toBe('pivot-measure:amount:0')
  })
})

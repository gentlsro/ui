import type * as PivotDraftModule from './pivot-configuration-draft'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import { PivotItem } from '../models/pivot-item.model'
import { normalizePivotMeasureIds } from './pivot-measure-id'

const summary = {
  SUM: 'SUM' as SummaryEnum,
  COUNT: 'COUNT' as SummaryEnum,
  AVERAGE: 'AVERAGE' as SummaryEnum,
  MEDIAN: 'MEDIAN' as SummaryEnum,
}

let draft: typeof PivotDraftModule

beforeAll(async () => {
  vi.stubGlobal('SummaryEnum', summary)
  vi.stubGlobal('isNumberDataType', (dataType: string) => dataType === 'number')
  vi.stubGlobal('stringToFloat', (value: string) => Number.parseFloat(value))
  draft = await import('./pivot-configuration-draft')
})

describe('pivot configuration draft behavior', () => {
  it('updates field usage immediately and creates repeated measure slots', () => {
    const item = new PivotItem({ field: 'cost', dataType: 'number' })
    const items = [item]

    draft.addPivotConfigurationRole({ items, item, role: 'value', index: 0 })
    expect(draft.isPivotConfigurationItemUsed(item)).toBe(true)

    draft.addPivotConfigurationRole({ items, item, role: 'value', index: 1 })

    expect(item.usage.value).toHaveLength(2)
    expect(new Set(item.usage.value!.map(slot => slot.id)).size).toBe(2)
    expect(item.usage.value!.map(slot => slot.summaryType)).toEqual([summary.SUM, summary.SUM])
  })

  it('defaults newly added nonnumeric measures to count', () => {
    const item = new PivotItem({ field: 'region', dataType: 'string' })

    draft.addPivotConfigurationRole({ items: [item], item, role: 'value', index: 0 })

    expect(item.usage.value?.[0]?.summaryType).toBe(summary.COUNT)
  })

  it('moves only the requested role and preserves unrelated usages', () => {
    const item = new PivotItem({
      field: 'cost',
      dataType: 'number',
      usage: {
        row: { index: 0 },
        column: { index: 0 },
      },
    })
    const items = [item]

    draft.removePivotConfigurationRole({ items, item, role: 'row' })
    draft.addPivotConfigurationRole({ items, item, role: 'value', index: 0 })

    expect(item.usage.row).toBeUndefined()
    expect(item.usage.column).toEqual({ index: 0 })
    expect(item.usage.value).toHaveLength(1)
  })

  it('preserves all filter conditions while reordering unique filter fields', () => {
    const first = new PivotItem({
      field: 'region',
      usage: {
        filter: [
          { index: 1, comparator: 'eq' as never, filterValue: 'EU' },
          { index: 2, comparator: 'eq' as never, filterValue: 'US' },
        ],
      },
    })
    const second = new PivotItem({
      field: 'status',
      usage: {
        filter: [{ index: 0, comparator: 'eq' as never, filterValue: 'active' }],
      },
    })
    const items = [first, second]

    draft.setPivotConfigurationRoleOrder(items, 'filter', [first, second])

    expect(first.usage.filter?.map(filter => filter.filterValue)).toEqual(['EU', 'US'])
    expect(first.usage.filter?.map(filter => filter.index)).toEqual([0, 1])
    expect(second.usage.filter?.[0]?.index).toBe(2)
  })

  it('normalizes legacy ids deterministically for the next apply', () => {
    const item = new PivotItem({
      field: 'cost',
      usage: {
        value: [
          { index: 1, summaryType: summary.COUNT },
          { index: 0, summaryType: summary.SUM },
        ],
      },
    })

    normalizePivotMeasureIds([item])

    expect(item.usage.value?.map(slot => slot.id)).toEqual([
      'pivot-measure:cost:1',
      'pivot-measure:cost:0',
    ])
  })
})

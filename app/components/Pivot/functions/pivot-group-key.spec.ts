import { beforeAll, describe, expect, it, vi } from 'vitest'
import type * as GroupKeyModule from './pivot-group-key'
import type * as TransformModule from './pivot-transform-data-core'

/**
 * Group labels sort by the language of the pivot (e.g. Czech: `Č` after `C`, `ch` after `h`); number and date
 * fields keep sorting by value. Without a locale, the order stays by character code.
 */

let groupKey: typeof GroupKeyModule
let transform: typeof TransformModule

beforeAll(async () => {
  vi.stubGlobal('SummaryEnum', { SUM: 'SUM', COUNT: 'COUNT', AVERAGE: 'AVERAGE', MEDIAN: 'MEDIAN' })
  vi.stubGlobal('getDateTypes', () => ['dateSimple'])
  vi.stubGlobal('getNumberDataTypes', () => ['number'])
  groupKey = await import('./pivot-group-key')
  transform = await import('./pivot-transform-data-core')
})

const CITIES = ['Zlín', 'Čechy', 'Cheb', 'Hradec', 'Brno']

function sortKeys(keys: string[], dataType: string, locale?: string) {
  return keys.toSorted(groupKey.getPivotGroupKeyComparator(dataType as any, locale))
}

describe('pivot group key order', () => {
  it('sorts text by the rules of the locale', () => {
    expect(sortKeys(CITIES, 'string', 'cs-CZ')).toEqual(['Brno', 'Čechy', 'Hradec', 'Cheb', 'Zlín'])
    expect(sortKeys(['b', 'B', 'a', 'A'], 'string', 'en-US')).toEqual(['a', 'A', 'b', 'B'])
  })

  it('keeps the empty group first', () => {
    expect(sortKeys(['Brno', '', 'Ábel'], 'string', 'cs-CZ')).toEqual(['', 'Ábel', 'Brno'])
  })

  it('orders distinct keys deterministically even when the locale compares them equal', () => {
    const keys = ['é', 'é']

    expect(sortKeys(keys, 'string', 'cs-CZ')).toEqual(sortKeys(keys.toReversed(), 'string', 'cs-CZ'))
  })

  it('keeps numeric order for number and date fields', () => {
    expect(sortKeys(['10', '9', '1'], 'number', 'cs-CZ')).toEqual(['1', '9', '10'])
    expect(sortKeys(['1705363200000', '946598400000'], 'dateSimple', 'cs-CZ')).toEqual(['946598400000', '1705363200000'])
  })

  it('sorts by character code without a locale', () => {
    expect(sortKeys(['b', 'a', 'A'], 'string')).toEqual(['A', 'a', 'b'])
  })

  it('orders pivot rows and columns by the payload locale', () => {
    const result = transform.pivotTransformDataCore({
      data: CITIES.map(city => ({ city, region: city, amount: 1 })),
      rows: [{ field: 'city', dataType: 'string', minWidth: 1, width: '1px', widthResolved: '1px', resizable: true }],
      columns: [{ field: 'region', dataType: 'string' }],
      values: [{ measureId: 'sum', field: 'amount', summaryType: 'SUM', widthResolved: '1px', _label: 'Sum' }],
      locale: 'cs-CZ',
    } as any)
    const czechOrder = ['Brno', 'Čechy', 'Hradec', 'Cheb', 'Zlín']

    expect(result.data.filter(row => row.rowItem.kind === 'data').map(row => row.groupPath[0])).toEqual(czechOrder)
    expect(result.columnTree.map(node => node.key)).toEqual(czechOrder)
  })
})

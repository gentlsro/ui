import { describe, expect, it } from 'vitest'
import { resolvePivotRowItemCell } from './pivot-resolve-row-item-cell'

/**
 * A promoted label (an expanded group's label shown on its first visible row, or on a pinned row) must display and
 * format like the group's own label: from the row's source item, with the level field's data type and format.
 * The group key in `groupPath` is not a display value (dates are keyed by timestamp).
 */

const dayField = { field: 'day', dataType: 'dateSimple', widthResolved: '120px' } as any
const regionField = { field: 'region', dataType: 'string', widthResolved: '120px' } as any
const ref = { region: 'EU', day: new Date('2024-01-16T10:00:00.000Z') }
const DAY_KEY = String(Date.UTC(2024, 0, 16))

function formatCellValue(payload: { value: unknown, dataType?: string }) {
  if (payload.dataType === 'dateSimple' && payload.value instanceof Date) {
    return `date:${payload.value.toISOString().slice(0, 10)}`
  }

  return payload.value === undefined || payload.value === null ? '' : String(payload.value)
}

function resolve(cell: { kind: string, rowFieldIndex: number, row: unknown }, promotedLevels: number[]) {
  return resolvePivotRowItemCell({
    item: { id: 'cell', groupId: `${cell.rowFieldIndex}:x`, ref, ...cell } as any,
    groupIds: ['0:EU', `1:EU/${DAY_KEY}`],
    groupPath: ['EU', DAY_KEY],
    promotedLevels,
    rows: [regionField, dayField, { field: 'bucket', dataType: 'number' }] as any,
    collapsedGroupIds: new Set(),
    localeIso: 'en-US',
    formatCellValue: formatCellValue as any,
  })
}

describe('promoted row labels', () => {
  it('formats a promoted date label from the source item with the field data type', () => {
    const promoted = resolve({ kind: 'empty', rowFieldIndex: 1, row: dayField }, [1])
    const own = resolve({ kind: 'rowLabel', rowFieldIndex: 1, row: dayField }, [])

    expect(promoted.displayValue).toBe('date:2024-01-16')
    expect(promoted.displayValue).toBe(own.displayValue)
    expect(promoted.isCollapsible).toBe(true)
  })

  it('shows promoted string labels unchanged', () => {
    expect(resolve({ kind: 'empty', rowFieldIndex: 0, row: regionField }, [0]).displayValue).toBe('EU')
  })

  it('keeps cells that are not promoted empty', () => {
    const cell = resolve({ kind: 'empty', rowFieldIndex: 1, row: dayField }, [0])

    expect(cell.displayValue).toBe('')
    expect(cell.showContent).toBe(false)
  })
})

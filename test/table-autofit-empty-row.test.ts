import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useRenderTemporaryTableCell } from '../app/components/Table/composables/useRenderTemporaryTableCell'

vi.mock('../app/components/Checkbox/Checkbox.vue', () => ({ default: {} }))

describe('table autofit cell measuring', () => {
  const setTempComponent = vi.fn(() => () => {})

  beforeEach(() => {
    // Nuxt auto-imports used by the composable
    vi.stubGlobal('useUIStore', () => ({ setTempComponent }))
    vi.stubGlobal('isNil', (val: unknown) => val === null || val === undefined)
    vi.stubGlobal('formatValue', (val: unknown) => String(val ?? ''))
    vi.stubGlobal('getComponentProps', () => ({ ui: () => ({}) }))
    vi.stubGlobal('h', (...args: unknown[]) => args)
    vi.stubGlobal('nextTick', () => Promise.resolve())
    vi.stubGlobal('document', { querySelector: () => ({ getBoundingClientRect: () => ({ width: 42 }) }) })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    setTempComponent.mockClear()
  })

  const col = {
    field: 'name',
    valueGetter: (row: any) => row.name,
  } as any

  it('does not render the slot or read the value when there is no row', async () => {
    const slotRenderFnc = vi.fn(({ row }: { row: any }) => row.name)
    const valueGetter = vi.fn((row: any) => row.name)
    const { getCellWidth } = useRenderTemporaryTableCell()

    await expect(getCellWidth({ row: undefined, col: { ...col, valueGetter }, slotRenderFnc })).resolves.toBe(0)
    await expect(getCellWidth({ row: null, col: { ...col, valueGetter } })).resolves.toBe(0)

    expect(slotRenderFnc).not.toHaveBeenCalled()
    expect(valueGetter).not.toHaveBeenCalled()
    expect(setTempComponent).not.toHaveBeenCalled()
  })

  it('still measures the slot when a row is present', async () => {
    const slotRenderFnc = vi.fn(({ row }: { row: any }) => row.name)
    const { getCellWidth } = useRenderTemporaryTableCell()

    await expect(getCellWidth({ row: { name: 'John' }, col, slotRenderFnc })).resolves.toBe(42)
    expect(slotRenderFnc).toHaveBeenCalledWith(expect.objectContaining({ row: { name: 'John' } }))
  })
})

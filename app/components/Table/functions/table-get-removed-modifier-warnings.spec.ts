import { describe, expect, it } from 'vitest'
import { tableGetRemovedModifierWarnings } from './table-get-removed-modifier-warnings'

describe('tableGetRemovedModifierWarnings', () => {
  it('returns nothing for missing or clean modifiers', () => {
    expect(tableGetRemovedModifierWarnings(undefined)).toEqual([])
    expect(tableGetRemovedModifierWarnings(null)).toEqual([])
    expect(tableGetRemovedModifierWarnings({})).toEqual([])
    expect(tableGetRemovedModifierWarnings({ useUrl: true })).toEqual([])
  })

  it('ignores a removed modifier explicitly set to undefined', () => {
    expect(tableGetRemovedModifierWarnings({ exportData: undefined })).toEqual([])
  })

  it('warns when `modifiers.exportData` is passed', () => {
    const warnings = tableGetRemovedModifierWarnings({ exportData: () => {} })

    expect(warnings).toHaveLength(1)
    expect(warnings[0]).toContain('modifiers.exportData')
    expect(warnings[0]).toContain('`exportData` prop')
  })
})

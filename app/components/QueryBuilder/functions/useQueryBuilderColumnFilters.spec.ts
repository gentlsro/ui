import { expect, it, vi } from 'vitest'
import { effectScope, reactive } from 'vue'
import type { IQueryBuilderProps } from '../types/query-builder-props.type'
import type { IQueryBuilderItem } from '../types/query-builder-item-props.type'
import type { IQueryBuilderGroup } from '../types/query-builder-group-props.type'
import { useQueryBuilderColumnFilters } from './useQueryBuilderColumnFilters'

it('updates and removes column filters through the supplied emitter without a component', () => {
  const scope = effectScope()
  const emit = vi.fn()
  const original = { id: 'filter', field: 'name', value: 'before', comparator: 'eq' }
  const props = reactive({ columns: [{ field: 'name', filterDbQuery: [original], filters: [original] }] })
  try {
    const filters = scope.run(() => useQueryBuilderColumnFilters(props as unknown as IQueryBuilderProps, emit))!
    const changed = { ...original, value: 'after' } as IQueryBuilderItem
    filters.modifyColumnFilter(changed)
    const group = filters.columnFilters.value[0] as IQueryBuilderGroup
    expect(group.children[0]).toMatchObject({ value: 'after' })
    expect(original.value).toBe('before')
    expect(emit).toHaveBeenNthCalledWith(1, 'update:columnFilter', group.children[0])
    filters.removeColumnFilter(changed)
    expect(group.children).toEqual([])
    expect(emit).toHaveBeenNthCalledWith(2, 'remove:columnFilter', changed)
    expect(emit).toHaveBeenCalledTimes(2)
  } finally {
    scope.stop()
  }
})

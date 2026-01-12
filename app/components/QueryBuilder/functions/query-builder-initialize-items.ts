// Types
import type { IQueryBuilderRow } from '../types/query-builder-row-props.type'

/**
 * Will initialize the query builder items with a default group
 */
export function queryBuilderInitializeItems(): IQueryBuilderRow[] {
  return [
    {
      id: generateUUID(),
      isGroup: true,
      children: [],
      condition: 'AND',
      path: '0',
    },
  ]
}

// Types
import type { IQueryBuilderRow } from '../types/query-builder-row-props.type'

export const queryBuilderDefault: IQueryBuilderRow[] = [
  {
    id: generateUUID(),
    isGroup: true,
    children: [],
    condition: 'AND',
    path: '0',
  },
]

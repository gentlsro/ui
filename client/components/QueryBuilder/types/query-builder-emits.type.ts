// Types
import type { IQueryBuilderItem } from './query-builder-item-props.type'

export type IQueryBuilderEmits = {
  (e: 'update:columnFilter', filter: IQueryBuilderItem): void
  (e: 'remove:columnFilter', filter: IQueryBuilderItem): void
}

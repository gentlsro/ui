// Types
import type { IQueryBuilderProps } from './query-builder-props.type'
import type { IQueryBuilderItem } from './query-builder-item-props.type'

export type IQueryBuilderEmits = {
  (e: 'update:allowNegation', value: IQueryBuilderProps['allowNegation']): void
  (e: 'update:maxLevel', value: IQueryBuilderProps['maxLevel']): void
  (e: 'update:breakpoint', value: IQueryBuilderProps['breakpoint']): void
  (e: 'update:columnFilter', filter: IQueryBuilderItem): void
  (e: 'remove:columnFilter', filter: IQueryBuilderItem): void
}

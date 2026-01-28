// Types
import type { IListItem } from './list-item.type'
import type { IListItemToAdd } from './list-item-to-add.type'

export type IListEmits = {
  (e: 'submit'): void
  (e: 'select:item', item: IListItem): void
  (e: 'unselect:item', item: IListItem): void
  (e: 'add:item', item: IListItemToAdd): void
  (e: 'remove:item', item: IListItemToAdd): void
  (e: 'click:item', row: IListItem): void
  (e: 'click:group', row: IGroupRow): void
  (e: 'change:contentSize', payload: { height: number }): void
  (e: 'move:item', payload: { item: any, items: any[] }): void
  (e: 'fetch:data', payload: {
    itemsFetched: IItem[]
    hasMore: boolean
    isFetchMore?: boolean
    currentItems: IItem[]
    totalRows: number
  }): void
}

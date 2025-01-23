// Types
import type { IListItem } from './list-item.type'
import type { IListItemToAdd } from './list-item-to-add.type'
import type { IGroupRow } from '$utils/shared/composables/useGrouping'

export type IListEmits = {
  (e: 'submit'): void
  (e: 'select:item', item: IListItem): void
  (e: 'unselect:item', item: IListItem): void
  (e: 'add:item', item: IListItemToAdd): void
  (e: 'remove:item', item: IListItemToAdd): void
  (e: 'click:item', row: IListItem): void
  (e: 'click:group', row: IGroupRow): void
  (e: 'change:contentSize', payload: { height: number, width: number }): void
}

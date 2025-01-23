import type { IListItem } from './list-item.type'

// Items adding within the list
export type IListItemToAdd = IListItem & {
  _isNew: boolean
}

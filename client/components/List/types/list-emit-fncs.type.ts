import type { IGroupRow } from '$utilsLayer/shared/composables/useGrouping'

// Types
import type { IListItem } from './list-item.type'
import type { IListItemToAdd } from './list-item-to-add.type'

export type IListEmitFncs = {
  select: (item: IListItem) => void
  unselect: (item: IListItem) => void
  add: (item: IListItemToAdd) => void
  remove: (item: IListItemToAdd) => void
  itemClick: (row: IListItem) => void
  groupClick: (row: IGroupRow) => void
}

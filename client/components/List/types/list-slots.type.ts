import type { IGroupRow } from '#layers/utilities/shared/composables/useGrouping'

// Types
import type { IListItem } from './list-item.type'
import type { IListProps } from './list-props.type'

export type IListSlots = {
  'search': (props: { ui?: IListProps['ui'] }) => any
  'content': (props: { ui?: IListProps['ui'], scrollerConfig?: IListProps['scrollerConfig'] }) => any
  'item'?: (props: { row: IListItem, index: number, isDisabled?: boolean, isSelected?: boolean }) => any
  'noData'?: () => any
  'loading'?: () => any
  'move-handle'?: () => any
  'above'?: (props: {
    items: NonNullable<IListProps['items']>
    listItems: Array<IListItem | IGroupRow>
  }) => any
  'below'?: (props: {
    items: NonNullable<IListProps['items']>
    listItems: Array<IListItem | IGroupRow>
  }) => any
}

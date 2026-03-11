// Types
import type { IListItem } from './list-item.type'
import type { IGroupRow } from '#layers/utilities/shared/composables/useGrouping'

export type IListFetchItems<T = any> = {
  fetchMore?: boolean
  hasMore?: boolean
  lastRow?: T
  lastVisibleRow?: T
  items?: T[]
  listItems?: Array<IListItem | IGroupRow>
}

export type IListFetchPayload<T = any> = {
  search?: string
  options?: IListFetchItems<T>
  abortController?: AbortController
}

export type IListFetchFnc<T = any> = (
  payload: IListFetchPayload
) => Promise<T> | T

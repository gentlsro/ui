// Types
import type { ITableProps } from './table-props.type'

// Functions
import type { tableBuildFetchPayload } from '../functions/table-build-fetch-payload'

export type ITableFetchPayload<
  K extends typeof tableBuildFetchPayload = typeof tableBuildFetchPayload,
> = ReturnType<NonNullable<NonNullable<ITableProps<K>['modifiers']>['buildFetchPayload']>> & IItem

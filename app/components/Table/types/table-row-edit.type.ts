/** A single save for the whole row; rejected saves keep the editor and its values open. */
export type ITableRowEdit = {
  /** New-row drafts can live outside the fetched rows and survive a query refresh. */
  isDraft?: (row: IItem) => boolean
  onSave: (payload: {
    row: IItem
    originalRow: IItem
    changedFields: string[]
  }) => Promise<IItem>
  onSaved?: (row: IItem) => void
  onCancel?: (row: IItem) => void
}

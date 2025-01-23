// Models
import type { TableColumn } from '../models/table-column.model'

export function tableEditMoveCell(payload: {
  tableEl: HTMLElement
  isCardView: boolean
  cellEdit: { row: IItem, column: TableColumn }
  ev: Partial<Pick<KeyboardEvent, 'key' | 'stopPropagation' | 'preventDefault'>>
}) {
  const { isCardView, cellEdit, tableEl, ev } = payload
  let currentCell = tableEl.querySelector('.active-edit-cell') as HTMLElement
  currentCell = currentCell?.closest('.td') as HTMLElement

  let nextCell: HTMLElement | undefined

  // Card view
  if (isCardView) {
    if (ev.key === 'ArrowUp') {
      const tableCells = tableEl.querySelectorAll('.td.is-editable') as NodeListOf<HTMLElement>
      const currentCellIdx = Array.from(tableCells).findIndex(el => el === currentCell)

      if (currentCellIdx > 0) {
        nextCell = tableCells[currentCellIdx - 1]
      }
    } else if (ev.key === 'ArrowDown') {
      const tableCells = tableEl.querySelectorAll('.td.is-editable') as NodeListOf<HTMLElement>
      const currentCellIdx = Array.from(tableCells).findIndex(el => el === currentCell)

      if (currentCellIdx < tableCells.length - 1) {
        nextCell = tableCells[currentCellIdx + 1]
      }
    } else if (ev.key === 'ArrowLeft') {
      const tableCells = tableEl.querySelectorAll(`.td.is-editable[data-field="${cellEdit.column.field}"]`) as NodeListOf<HTMLElement>
      const currentCellIdx = Array.from(tableCells).findIndex(el => el === currentCell)

      if (currentCellIdx > 0) {
        nextCell = tableCells[currentCellIdx - 1]
      }
    } else if (ev.key === 'ArrowRight') {
      const tableCells = tableEl.querySelectorAll(`.td.is-editable[data-field="${cellEdit.column.field}"]`) as NodeListOf<HTMLElement>
      const currentCellIdx = Array.from(tableCells).findIndex(el => el === currentCell)

      if (currentCellIdx < tableCells.length - 1) {
        nextCell = tableCells[currentCellIdx + 1]
      }
    }
  }

  // Row view
  else {
    if (ev.key === 'ArrowUp') {
      const tableCells = tableEl.querySelectorAll(`.td.is-editable[data-field="${cellEdit.column.field}"]`) as NodeListOf<HTMLElement>
      const currentCellIdx = Array.from(tableCells).findIndex(el => el === currentCell)

      if (currentCellIdx > 0) {
        nextCell = tableCells[currentCellIdx - 1]
      }
    } else if (ev.key === 'ArrowDown') {
      const tableCells = tableEl.querySelectorAll(`.td.is-editable[data-field="${cellEdit.column.field}"]`) as NodeListOf<HTMLElement>
      const currentCellIdx = Array.from(tableCells).findIndex(el => el === currentCell)

      if (currentCellIdx < tableCells.length - 1) {
        nextCell = tableCells[currentCellIdx + 1]
      }
    } else if (ev.key === 'ArrowLeft') {
      const tableCells = tableEl.querySelectorAll('.td.is-editable') as NodeListOf<HTMLElement>
      const currentCellIdx = Array.from(tableCells).findIndex(el => el === currentCell)

      if (currentCellIdx > 0) {
        nextCell = tableCells[currentCellIdx - 1]
      }
    } else if (ev.key === 'ArrowRight') {
      const tableCells = tableEl.querySelectorAll('.td.is-editable') as NodeListOf<HTMLElement>
      const currentCellIdx = Array.from(tableCells).findIndex(el => el === currentCell)

      if (currentCellIdx < tableCells.length - 1) {
        nextCell = tableCells[currentCellIdx + 1]
      }
    }
  }

  const nextCellEditBtn = nextCell?.querySelector('.edit-btn') as HTMLElement

  if (nextCellEditBtn) {
    nextCellEditBtn.click()
    nextCellEditBtn.scrollIntoView({ block: 'nearest' })

    ev.preventDefault?.()
    ev.stopPropagation?.()
  }
}

// Models
import type { TableColumn } from '../models/table-column.model'

export function tableEditMoveCell(payload: {
  tableEl: HTMLElement
  isCardView: boolean
  cellEdit: { row: IItem, column: TableColumn }
  ev: Partial<Pick<KeyboardEvent, 'key' | 'stopPropagation' | 'preventDefault'>>
  virtualScrollEl?: any
}) {
  const { isCardView, cellEdit, tableEl, ev, virtualScrollEl } = payload
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

  const nextCellEditBtn = isCardView
    ? nextCell?.querySelector('.edit-btn') as HTMLElement
    : nextCell as HTMLElement

  if (nextCellEditBtn) {
    nextCellEditBtn.click()
    ;(nextCellEditBtn.parentNode as HTMLElement)?.scrollIntoView({ block: 'center' })

    virtualScrollEl?.triggerScrollEvent()

    ev.preventDefault?.()
    ev.stopPropagation?.()
  }
}

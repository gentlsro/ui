import type { Ref } from 'vue'
import type { TableColumn } from '../models/table-column.model'
import type { useTableStore } from '../stores/table.store'
import type { ITableProps } from '../types/table-props.type'
import { useEventListener, useMutationObserver } from '@vueuse/core'
import { nextTick, watch } from 'vue'
import { tableEditMoveCell } from '../functions/table-edit-move-cell'
import { tableIsCellEditable } from '../functions/table-is-cell-editable'
import { isTableBooleanCheckbox, tableToggleBooleanCell } from '../functions/table-toggle-boolean-cell'

export function useTableCellNavigation(store: ReturnType<typeof useTableStore>, editable: Ref<ITableProps['editable']>) {
  const {
    selectedCell,
    cellEdit,
    tableEl,
    rows,
    rowKey,
    visibleColumns,
    isCardView,
    rowsColumnCount,
    virtualScrollEl,
  } = store

  let pendingFocus = false
  let leavingGrid = false

  function findSelectedCell() {
    const selected = selectedCell.value

    if (!selected) {
      return
    }

    return Array.from(tableEl.value?.querySelectorAll<HTMLElement>('.td[data-key][data-field]') ?? [])
      .find(el => el.dataset.key === String(selected.rowKey) && el.dataset.field === selected.field)
  }

  // Keep a rendered cell tabbable when the selected cell scrolls out of view.
  function updateTabStop() {
    const cells = Array.from(tableEl.value?.querySelectorAll<HTMLElement>('.td.is-editable[data-key][data-field]') ?? [])

    const selected = findSelectedCell()
    const tabStop = isCardView.value ? undefined : selected && cells.includes(selected) ? selected : cells[0]

    for (const cell of cells) {
      cell.tabIndex = cell === tabStop ? 0 : -1
    }
  }

  function focusSelectedCell() {
    if (isCardView.value || !pendingFocus || cellEdit.value) {
      return
    }

    const el = findSelectedCell()

    if (!el) {
      return
    }

    pendingFocus = false

    el.focus({ preventScroll: true })
    el.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }

  async function revealSelection() {
    if (isCardView.value) {
      return
    }

    pendingFocus = true
    await nextTick()

    if (isCardView.value || !pendingFocus || cellEdit.value) {
      return
    }

    if (!findSelectedCell()) {
      const index = rows.value.findIndex(row => row[rowKey.value] === selectedCell.value?.rowKey)
      const columnIndex = visibleColumns.value.findIndex(column => column.field === selectedCell.value?.field)

      // If the selected cell is not in the rendered window, scroll to it.
      if (index < 0 || columnIndex < 0) {
        pendingFocus = false
        selectedCell.value = undefined
        return
      }

      virtualScrollEl.value?.scrollTo?.(Math.floor(index / rowsColumnCount.value))
      virtualScrollEl.value?.scrollToColumn?.(columnIndex)
      virtualScrollEl.value?.triggerScrollEvent?.()
      await nextTick()
    }

    focusSelectedCell()
  }

  useMutationObserver(tableEl, () => {
    updateTabStop()
    focusSelectedCell()
  }, { 
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'data-key', 'data-field'],
  })
  
  watch([tableEl, selectedCell, isCardView], updateTabStop, { flush: 'post' })

  watch(selectedCell, () => {
    if (selectedCell.value) {
      void revealSelection()
    } else {
      pendingFocus = false
    }
  })

  watch(cellEdit, (current, previous) => {
    if (current) {
      pendingFocus = false
    } else if (previous && selectedCell.value && !leavingGrid) {
      void revealSelection()
    }

    leavingGrid = false
  })

  watch([rows, visibleColumns], () => {
    const selected = selectedCell.value

    if (selected && (!rows.value.some(row => row[rowKey.value] === selected.rowKey)
      || !visibleColumns.value.some(column => column.field === selected.field))
    ) {
      selectedCell.value = undefined
      cellEdit.value = undefined
    }
  })

  useEventListener(tableEl, 'focusin', (ev: FocusEvent) => {
    const el = ev.target

    if (isCardView.value || !(el instanceof HTMLElement) || !el.matches('.td.is-editable')) {
      return
    }

    const row = rows.value.find(row => String(row[rowKey.value]) === el.dataset.key)

    if (row && (selectedCell.value?.rowKey !== row[rowKey.value] || selectedCell.value?.field !== el.dataset.field)) {
      selectedCell.value = { rowKey: row[rowKey.value], field: el.dataset.field! }
    }
  })

  function replaceFocusedInput(text: string) {
    void nextTick(() => {
      const input = document.activeElement
      const editor = findSelectedCell()?.querySelector('.active-edit-cell')

      if (
        (input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement)
        && input.matches('.control:not([disabled]):not([readonly])')
        && editor?.contains(input)
      ) {
        input.value = text
        input.dispatchEvent(new Event('input', { bubbles: true }))
      }
    })
  }

  function startEditing(row: IItem, column: TableColumn, text?: string) {
    if (!tableIsCellEditable(row, column) || isTableBooleanCheckbox(column)) {
      return false
    }

    cellEdit.value = { row, column }
    store.loadCellEditValue()

    if (text !== undefined) {
      replaceFocusedInput(text)
    }

    return true
  }

  // Return false when native Tab should move focus out of the table.
  function moveSelection(ev: KeyboardEvent, target: HTMLElement, rowIndex: number, columnIndex: number) {
    const destination = tableEditMoveCell({
      rows: rows.value,
      columns: visibleColumns.value,
      rowIndex,
      columnIndex,
      key: ev.key,
      shiftKey: ev.shiftKey,
      isCardView: isCardView.value,
    })

    leavingGrid = !destination && ev.key === 'Tab'

    if (cellEdit.value) {
      store.saveCellEditValue()
      cellEdit.value = undefined
    }

    // Move to the next cell.
    if (destination) {
      selectedCell.value = { rowKey: destination.row[rowKey.value], field: destination.column.field }
    } else if (ev.key === 'Tab') {
      // Focus the cell so native Tab skips the editor's controls.
      pendingFocus = false

      target.closest('.active-edit-cell')?.querySelectorAll<HTMLElement>('input, textarea, select, button, a, [tabindex]').forEach(el => el.tabIndex = -1)
      findSelectedCell()?.focus({ preventScroll: true })
      return false
    }

    return true
  }

  useEventListener(tableEl, 'keydown', (ev: KeyboardEvent) => {
    const target = ev.target

    if (isCardView.value || !(target instanceof HTMLElement) || ev.defaultPrevented || ev.isComposing || ev.altKey) {
      return
    }
    
    const editMode = editable.value ?? false
    const enabled = editMode === true
      || (editMode !== false && editMode.view === (isCardView.value ? 'card' : 'row'))

    if (!enabled || !selectedCell.value) {
      return
    }

    const editing = !!cellEdit.value

    if (editing) {
      const editor = target.closest('.active-edit-cell')
      if (!editor) {
        return
      }

      // Let open pickers handle their keys.
      if (target.closest('[data-editor-popup-open], [aria-expanded="true"]')
        || editor.querySelector('[aria-expanded="true"]')) {
        return
      }
    } else if (target !== findSelectedCell()) {
      return
    }

    const rowIndex = rows.value.findIndex(row => row[rowKey.value] === selectedCell.value?.rowKey)
    const columnIndex = visibleColumns.value.findIndex(column => column.field === selectedCell.value?.field)
    const row = rows.value[rowIndex]
    const column = visibleColumns.value[columnIndex]

    if (!row || !column) {
      return
    }

    if (!editing && (ev.key === ' ' || ev.key === 'Enter') && !ev.ctrlKey && !ev.metaKey && isTableBooleanCheckbox(column)) {
      if (!ev.repeat) {
        tableToggleBooleanCell(store, row, column)
      }
    } else if (ev.key === 'Escape' && editing) {
      cellEdit.value = undefined
    } else if (editing && ev.key === 'Enter' && (ev.ctrlKey || ev.metaKey)) {
      store.saveCellEditValue()
      cellEdit.value = undefined
    } else if ((editing && ev.key === 'Enter') || ev.key === 'Tab' || (!editing && ev.key.startsWith('Arrow'))) {
      if (ev.ctrlKey || ev.metaKey) {
        return
      }

      if (!moveSelection(ev, target, rowIndex, columnIndex)) {
        return
      }
    } else if (!editing && !ev.ctrlKey && !ev.metaKey
      && (ev.key === 'Enter' || ev.key === 'F2' || ev.key.length === 1)
    ) {
      if (!startEditing(row, column, ev.key.length === 1 ? ev.key : undefined)) {
        return
      }
    } else {
      return
    }
    
    ev.preventDefault()
    ev.stopPropagation()
  })
}

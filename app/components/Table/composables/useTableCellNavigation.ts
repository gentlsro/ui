import type { Ref } from 'vue'
import type { TableColumn } from '../models/table-column.model'
import type { useTableStore } from '../stores/table.store'
import type { ITableProps } from '../types/table-props.type'
import { useEventListener, useMutationObserver } from '@vueuse/core'
import { isObject } from 'lodash-es'
import { nextTick, toRaw, watch } from 'vue'
import { tableEditMoveCell } from '../functions/table-edit-move-cell'
import { tableIsCellEditable } from '../functions/table-is-cell-editable'
import { tableIsEditorPopupOpen } from '../functions/table-is-editor-popup-open'
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
    if (isCardView.value || !pendingFocus || cellEdit.value.length) {
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

    if (isCardView.value || !pendingFocus || cellEdit.value.length) {
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

  watch(() => cellEdit.value.length, (current, previous) => {
    if (current) {
      pendingFocus = false
    } else if (previous && selectedCell.value && !leavingGrid) {
      void revealSelection()
    }

    leavingGrid = false
  })

  watch([() => [...rows.value], () => [...visibleColumns.value]], () => {
    const selected = selectedCell.value

    if (selected && (!rows.value.some(row => row[rowKey.value] === selected.rowKey)
      || !visibleColumns.value.some(column => column.field === selected.field))
    ) {
      selectedCell.value = undefined
      store.cancelCellEdit()
    }

    // Keys can survive a refresh while the objects held by the editors do not.
    if (cellEdit.value.some(edit => !rows.value.some(row => toRaw(row) === toRaw(edit.row))
      || !visibleColumns.value.some(column => column.field === edit.column.field && tableIsCellEditable(edit.row, column)))) {
      store.cancelCellEdit()
    }
    // Cancel edits immediately when their row or column disappears
  }, { flush: 'sync' })

  useEventListener(tableEl, 'focusin', (ev: FocusEvent) => {
    const el = ev.target

    if (isCardView.value || !(el instanceof HTMLElement)) {
      return
    }

    const cell = el.closest<HTMLElement>('.td.is-editable')

    if (!cell) {
      return
    }

    const row = rows.value.find(row => String(row[rowKey.value]) === cell.dataset.key)

    if (row && (selectedCell.value?.rowKey !== row[rowKey.value] || selectedCell.value?.field !== cell.dataset.field)) {
      selectedCell.value = { rowKey: row[rowKey.value], field: cell.dataset.field! }
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

    store.startCellEdit(row, column)

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

    if (
      destination && cellEdit.value.length > 1 
      && cellEdit.value.some(edit => edit.row === destination.row && edit.column.field === destination.column.field)
    ) {
      selectedCell.value = { 
        rowKey: destination.row[rowKey.value], 
        field: destination.column.field 
      }

      void nextTick(() => {
        findSelectedCell()?.querySelector<HTMLElement>('.active-edit-cell .control, .active-edit-cell [tabindex]')
          ?.focus({ preventScroll: true })
      })

      return true
    }

    leavingGrid = !destination && ev.key === 'Tab'

    if (cellEdit.value.length) {
      store.saveCellEditValue()
      store.cancelCellEdit()
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
      || (isObject(editMode) && (!editMode.view || editMode.view === 'row'))

    const editing = cellEdit.value.length > 0
    const isRowEdit = editing ? store.cellEditMode.value === 'row' : isObject(editMode) && editMode.mode === 'row'

    if (!enabled || isRowEdit || !selectedCell.value) {
      return
    }

    if (editing) {
      const editor = target.closest('.active-edit-cell')
      if (!editor) {
        return
      }

      // Let open pickers handle their keys.
      if (tableIsEditorPopupOpen(target)) {
        return
      }

      if (target instanceof HTMLTextAreaElement && ev.key === 'Enter' && !ev.ctrlKey && !ev.metaKey) {
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
      store.cancelCellEdit()
    } else if (editing && ev.key === 'Enter' && (ev.ctrlKey || ev.metaKey)) {
      store.saveCellEditValue()
      store.cancelCellEdit()
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

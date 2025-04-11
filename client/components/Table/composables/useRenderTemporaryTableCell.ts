// @unocss-include

import { formatValue } from '$utils'
import type { ITableProps } from '../types/table-props.type'

// Models
import { TableColumn } from '../models/table-column.model'

// Functions
import { getComponentProps } from '../../../functions/get-component-props'

// Components
import Checkbox from '../../Checkbox/Checkbox.vue'
import TableHeaderCell from '../TableHeader/TableHeaderCell.vue'

/**
 * Splits a string into two sections at a word boundary near the middle and returns the longer section.
 * If the string is empty, returns an empty string.
 * 
 * NOTE: Modified from Claude's original implementation
 */
function splitStringInMiddle(input: string): string {
  if (!input) {
    return "";
  }
  
  const words = input.split(" ");
  
  // If single word or empty, return the input
  if (words.length <= 1) return input;
  
  // For two words, return the longer one
  if (words.length === 2) {
    return words[0]!.length >= words[1]!.length ? words[0]! : words[1]!;
  }
  
  // Find the middle word index
  const middleWordIndex = Math.floor(words.length / 2);
  
  // Create the two parts
  const firstPart = words.slice(0, middleWordIndex).join(" ");
  const secondPart = words.slice(middleWordIndex).join(" ");
  
  // Return the longer part
  return firstPart.length >= secondPart.length ? firstPart : secondPart;
}


export function useRenderTemporaryTableCell() {
  const { setTempComponent } = useUIStore()

  async function getCellWidth(payload: {
    row: any,
    col: TableColumn<any>,
    slotRenderFnc?: Function,
    ui?: ITableProps['ui'], 
  }) {
    const { row, col, slotRenderFnc, ui } = payload

    let maxContentWidth = 0
    let cleanup: () => void = () => {}

    const value = col.valueGetter(row)
    const formattedValue = formatValue(value, row, { format: col.format, dataType: col.dataType })
    
    // @ts-expect-error
    const { cellInnerClass, cellInnerStyle, cellClass, cellStyle } = ui ?? getComponentProps('table').ui?.() ?? {}

    const _cellClass = [cellClass, 'flex', 'items-center']

    // NOTE - When using a slot, we need to render the component that is being
    //        used in the slot, so we can get the actual width of the cell
    if (slotRenderFnc) {
      const vnode = slotRenderFnc({
        row,
        index: 0,
        refreshDataFnc: () => {},
      })

      cleanup = setTempComponent(
        () => h(
          'div',
          { style: cellStyle, class: _cellClass },
          [vnode],
        ),
      )
      await nextTick()

      const tempComponentDom = document.querySelector('#tempComponent')
      maxContentWidth = tempComponentDom?.getBoundingClientRect().width || 0
    }

    // NOTE - When not using a slot, we just use the TableCell to render the
    //        cell, and get the width of the cell
    else {
      cleanup = setTempComponent(() => {
        return col.dataType === 'boolean'
          ? h(
              Checkbox,
              { size: 'sm', modelValue: value, label: formattedValue },
            )
          : h(
              'div',
              { style: cellStyle, class: _cellClass },
              [h('span', { class: cellInnerClass, style: cellInnerStyle }, [formattedValue])],
            )
      },
      )
      await nextTick()

      const tempComponentDom = document.querySelector('#tempComponent')
      maxContentWidth = tempComponentDom?.getBoundingClientRect().width || 0
    }

    cleanup()

    return maxContentWidth
  }

  async function getHeaderWidth(
    col: TableColumn<any>,
    ui?: ITableProps['ui'],
  ) {
    let cleanup: () => void = () => {}
    let maxContentWidth = 0

    // Split the label into two sections at a word boundary near the middle
    // in case we have a longer label
    const longerPart = col._label.length > 16
      ? splitStringInMiddle(col._label)
      : col._label

    // @ts-expect-error
    const { headerCellClass, headerCellInnerClass, headerCellStyle, headerCellInnerStyle } = ui ?? getComponentProps('table').ui?.() ?? {}

    // UI
    const _headerCellClass = ['flex items-center gap-2', headerCellClass, col.headerClass]
    const _headerCellStyle = { ...headerCellStyle, ...col.headerStyle }

    const _headerCellInnerClass = [headerCellInnerClass]
    const _headerCellInnerStyle = headerCellInnerStyle

    const isHelperCol = col.isHelperCol || col.nonInteractive
    const hasFilterBtn = (col.filterable || col.sortable) && !isHelperCol

    cleanup = setTempComponent(() => {
      return h(
        'div',
        { class: _headerCellClass, style: _headerCellStyle },
        [
          h('span', { class: _headerCellInnerClass, style: _headerCellInnerStyle }, [longerPart]),
          ...(hasFilterBtn ? [h('div', { style: { flexShrink: 0, width: '32px', height: '32px' } })] : []),
        ],
      )
    },
    )
    await nextTick()

    const tempComponentDom = document.querySelector('#tempComponent')
    maxContentWidth = tempComponentDom?.getBoundingClientRect().width || 0

    cleanup()

    return maxContentWidth
  }

  return { getCellWidth, getHeaderWidth }
}

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
 * Splits a string at a word boundary near the middle and returns the longer part.
 * If the string is empty, returns an empty string.
 * 
 * NOTE: Made by Claude
 */
function splitStringInMiddle(input: string): string {
  if (!input) {
    return ""
  };
  
  const words = input.split(" ");
  
  // If single word or empty, return the input
  if (words.length <= 1) return input;
  
  // For two words, return the longer one
  if (words.length === 2) {
    return words[0]!.length >= words[1]!.length ? words[0]! : words[1]!;
  }
  
  // Find approximate middle position
  const middlePos = Math.floor(input.length / 2);
  
  // Find word boundary nearest to the middle
  let splitIndex = 0;
  let currentPos = 0;
  
  for (let i = 0; i < words.length; i++) {
    const wordLength = words[i]!.length;
    
    // If adding this word crosses or gets closer to the middle, track this position
    if (currentPos + wordLength >= middlePos) {
      splitIndex = i;
      break;
    }
    
    // Add word length plus space
    currentPos += wordLength + 1;
  }
  
  // Create the two parts
  const firstPart = words.slice(0, splitIndex).join(" ");
  const secondPart = words.slice(splitIndex).join(" ");
  
  // Return the longer part
  return firstPart.length >= secondPart.length ? firstPart : secondPart;
}


export function useRenderTemporaryTableCell() {
  const { setTempComponent } = useUIStore()

  async function getCellWidth(
    row: any,
    col: TableColumn<any>,
    slotRenderFnc?: Function,
  ) {
    let maxContentWidth = 0
    let cleanup: () => void = () => {}

    const value = col.valueGetter(row)
    const formattedValue = formatValue(value, row, { format: col.format, dataType: col.dataType })

    // @ts-expect-error
    const { cellInnerClass, cellInnerStyle, cellClass, cellStyle } = getComponentProps('table').ui?.() ?? {}

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

    const longerPart = splitStringInMiddle(col._label)

    cleanup = setTempComponent(() => {
      return h(
        TableHeaderCell,
        { ui, column: new TableColumn({ ...col, label: longerPart, width: 'auto' }) },
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

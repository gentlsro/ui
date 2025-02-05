// @unocss-include

import { formatValue } from '$utils'

// Models
import type { TableColumn } from '../models/table-column.model'

// Functions
import { getComponentProps } from '../../../functions/get-component-props'

// Components
import Checkbox from '../../Checkbox/Checkbox.vue'

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
              [h('span', { class: cellInnerClass, style: cellInnerStyle }, formattedValue)],
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

  return { getCellWidth }
}

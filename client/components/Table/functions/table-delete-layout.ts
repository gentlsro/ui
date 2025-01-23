// Types
import type { ITableLayout } from '../types/table-layout.type'

export async function tableDeleteLayout(payload: {
  layout: ITableLayout

  /**
   * Currently available layouts
   */
  layouts: ITableLayout[]
}) {
  const { layout, layouts } = payload
  console.log('Log ~ layouts:', layouts)
  console.log('Log ~ layout:', layout)

  const idx = layouts.findIndex(l => l.id === layout.id)
  console.log('Log ~ idx:', idx)

  if (idx > -1) {
    layouts.splice(idx, 1)
  }
}

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

  const idx = layouts.findIndex(l => l.id === layout.id)

  if (idx > -1) {
    layouts.splice(idx, 1)
  }
}

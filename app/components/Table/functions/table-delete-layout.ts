// Types
import type { ITableLayout } from '../types/table-layout.type'

export async function tableDeleteLayout(payload: {
  /**
   * The layout to delete
   */
  layout: ITableLayout

  /**
   * Custom data provided from the table store
   */
  customData: IItem

  /**
   * Handle request function
   */
  handleRequest: ReturnType<typeof useRequest>['handleRequest']

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

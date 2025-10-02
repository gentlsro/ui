// Types
import type { ITableLayout } from '../types/table-layout.type'

// Functions
import { tableOnLayoutApply } from './table-on-layout-apply'
import { tableTransformColumns } from './table-transform-columns'
import { queryBuilderInitializeItems } from '../../QueryBuilder/functions/query-builder-initialize-items'

// Store
import type { useTableStore } from '../stores/table.store'

export function tableApplyLayout(payload: {
  layout?: ITableLayout
  getStore: () => ReturnType<typeof useTableStore>
}) {
  let { layout, getStore } = payload

  const store = getStore()
  const {
    internalColumns,
    state,
    modifiers,
    queryBuilder: queryBuilderStore,
  } = storeToRefs(store)

  if (!layout) {
    // We reset filters, query builder, sorting and selection
    queryBuilderStore.value = queryBuilderInitializeItems()

    internalColumns.value.forEach(col => {
      if (!col.nonInteractive && !col.isHelperCol) {
        col.clearFilters()
        col.sort = undefined
        col.sortOrder = undefined
        col.hidden = true
      }
    })

    layout = state.value.layoutDefault
  }

  const { onLayoutApply = tableOnLayoutApply } = modifiers.value ?? {}
  const _layout = onLayoutApply({
    layout: layout as ITableLayout,
    columns: internalColumns.value,
    modifiers: modifiers.value,
    getStore: () => store,
  })

  const {
    columns,
    queryBuilder,
  } = tableTransformColumns({
    internalColumns: internalColumns.value,
    modifiers: modifiers.value,
    defaultSchema: _layout?.schema ?? '',
    urlSchema: '',
    shouldUrlBeUsed: false,
  })

  // Make sure that if no columns are selected, we fallback to showing all of them
  // const isAllColumnsHidden = columns.every(col => col.hidden || col.isHelperCol)

  // if (isAllColumnsHidden) {
  //   columns.forEach(col => {
  //     col.hidden = false
  //   })
  // }

  internalColumns.value = columns
  queryBuilderStore.value = queryBuilder.length ? queryBuilder : queryBuilderInitializeItems()
}

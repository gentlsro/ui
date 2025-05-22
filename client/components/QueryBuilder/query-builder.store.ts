// Types
import type { IQueryBuilderRow } from './types/query-builder-row-props.type'
import type { IQueryBuilderDraggedItem } from './types/query-builder-dragged-item.type'

// Models
import type { TableColumn } from '../Table/models/table-column.model'
import type { IQueryBuilderProps } from './types/query-builder-props.type'

export const queryBuilderIdKey = Symbol('__queryBuilderId')

export function useQueryBuilderStore(payload?: {
  queryBuilderId?: string
  queryBuilderProps?: IQueryBuilderProps
}) {
  const { queryBuilderId, queryBuilderProps } = payload ?? {}
  const _queryBuilderId = injectLocal(queryBuilderIdKey, queryBuilderId ?? useId())

  return defineStore(`queryBuilder.${_queryBuilderId}`, () => {
    // Data
    const columns = ref<TableColumn<any>[]>([])
    const items = ref<IQueryBuilderRow[]>([])
    const draggedItem = ref<IQueryBuilderDraggedItem | undefined>()
    const collapsedById = ref<Record<string | number, boolean>>({})

    // Layout
    const maxNestingLevel = ref(queryBuilderProps?.maxLevel ?? 0)
    const isSmallerScreen = ref(false)
    const queryBuilderEl = ref<HTMLElement>()
    const hoveredItem = ref<IQueryBuilderRow | undefined>()
    const breakpoint = ref(queryBuilderProps?.breakpoint ?? 1024)

    const queryBuilderElRect = ref<DOMRect>()

    const getFilterComponentFnc = ref<IQueryBuilderProps['getFilterComponent']>(queryBuilderProps?.getFilterComponent)

    useResizeObserver(queryBuilderEl, entries => {
      requestAnimationFrame(() => {
        const { contentRect } = entries?.[0] ?? {}

        isSmallerScreen.value = contentRect!.width < breakpoint.value
        queryBuilderElRect.value = queryBuilderEl.value?.getBoundingClientRect()
      })
    })

    return {
      // Data
      columns,
      items,
      draggedItem,
      collapsedById,

      // Layout
      queryBuilderEl,
      queryBuilderElRect,
      hoveredItem,
      maxNestingLevel,
      isSmallerScreen,
      breakpoint,
      getFilterComponentFnc,
    }
  })()
}

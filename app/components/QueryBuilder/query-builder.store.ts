// Types
import type { IQueryBuilderRow } from './types/query-builder-row-props.type'
import type { IQueryBuilderDraggedItem } from './types/query-builder-dragged-item.type'

// Models
import type { TableColumn } from '../Table/models/table-column.model'
import type { IQueryBuilderProps } from './types/query-builder-props.type'

export const QUERY_BUILDER_ID_KEY = Symbol('__queryBuilderId')

type IConfig = {
  queryBuilderProps?: IQueryBuilderProps
  injectionKey?: string
}

// export function useQueryBuilderStore(payload?: {
//   queryBuilderId?: string
//   queryBuilderProps?: IQueryBuilderProps
// }) {
//   return defineStore(`queryBuilder.${_queryBuilderId}`, () => {

//     // Layout

//     const getFilterComponentFnc = ref<IQueryBuilderProps['getFilterComponent']>(queryBuilderProps?.getFilterComponent)

//     useResizeObserver(queryBuilderEl, entries => {
//       requestAnimationFrame(() => {
//         const { contentRect } = entries?.[0] ?? {}

//         isSmallerScreen.value = contentRect!.width < breakpoint.value
//         queryBuilderElRect.value = queryBuilderEl.value?.getBoundingClientRect()
//       })
//     })

//     return {
//       // Data
//       columns,
//       items,
//       draggedItem,
//       collapsedById,

//       // Layout
//       allowNegation,
//       queryBuilderEl,
//       queryBuilderElRect,
//       hoveredItem,
//       maxNestingLevel,
//       isSmallerScreen,
//       breakpoint,
//       getFilterComponentFnc,
//     }
//   })()
// }

function createStore(injectionKey?: string) {
  const injectionState = createInjectionState((payload?: IConfig) => {
    const { queryBuilderProps } = payload ?? {}

    // Utils
    const instance = getCurrentInstance()

    // Data
    const columns = ref<TableColumn<any>[]>([])
    const draggedItem = ref<IQueryBuilderDraggedItem | undefined>()
    const collapsedById = ref<Record<string | number, boolean>>({})

    const items = initRef({
      propName: 'items',
      instance,
      props: queryBuilderProps,
      defaultValue: [],
    }) as Ref<IQueryBuilderRow[]>

    // Layout
    const queryBuilderEl = ref<HTMLElement>()
    const isSmallerScreen = ref(false)
    const hoveredItem = ref<IQueryBuilderRow | undefined>()
    const queryBuilderElRect = ref<DOMRect>()

    const allowNegation = initRef({
      propName: 'allowNegation',
      instance,
      props: queryBuilderProps,
      defaultValue: false,
    }) as Ref<boolean>

    const maxNestingLevel = initRef({
      propName: 'maxLevel',
      instance,
      props: queryBuilderProps,
      defaultValue: 3,
    }) as Ref<number>

    const breakpoint = initRef({
      propName: 'breakpoint',
      instance,
      props: queryBuilderProps,
      defaultValue: 1024,
    }) as Ref<number>

    const getFilterComponentFnc = ref<IQueryBuilderProps['getFilterComponent']>(queryBuilderProps?.getFilterComponent)

    const returnedData = {
      // Data
      columns,
      items,
      draggedItem,
      collapsedById,

      // Layout
      allowNegation,
      maxNestingLevel,
      queryBuilderEl,
      isSmallerScreen,
      hoveredItem,
      queryBuilderElRect,
      breakpoint,
      getFilterComponentFnc,
    }

    return returnedData
  }, { injectionKey })

  return injectionState
}

export function useQueryBuilderStore(payload?: IConfig) {
  let injectionKey = payload?.injectionKey ?? injectLocal(QUERY_BUILDER_ID_KEY)

  if (!injectionKey) {
    const uuid = generateUUID()
    provideLocal(QUERY_BUILDER_ID_KEY, uuid)
    injectionKey = uuid
  }

  const [useProvideQueryBuilderStore, useConsumeQueryBuilderStore] = createStore(injectionKey)!

  return useConsumeQueryBuilderStore() ?? useProvideQueryBuilderStore(payload)
}

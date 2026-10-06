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

function createStore(injectionKey?: string) {
  const injectionState = createInjectionState((payload?: IConfig) => {
    const { queryBuilderProps } = payload ?? {}

    // Utils
    const instance = getCurrentInstance()

    // Data
    const columns = ref([]) as Ref<TableColumn<any>[]>
    const draggedItem = ref<IQueryBuilderDraggedItem | undefined>()
    const collapsedById = ref<Record<string | number, boolean>>({})

    const items = ref<IQueryBuilderRow[]>([])

    // Layout
    const queryBuilderEl = ref<HTMLElement>()
    const isSmallerScreen = ref(false)
    const hoveredItem = ref<IQueryBuilderRow | undefined>()

    // A newly added condition focuses its field once it mounts
    const itemIdToFocus = ref<string>()

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
      breakpoint,
      getFilterComponentFnc,
      itemIdToFocus,
    }

    return returnedData
  }, { injectionKey })

  return injectionState
}

export function useQueryBuilderStore(payload?: IConfig) {
  let injectionKey = payload?.injectionKey ?? injectLocal(QUERY_BUILDER_ID_KEY, undefined)

  if (!injectionKey) {
    const uuid = generateUUID()
    provideLocal(QUERY_BUILDER_ID_KEY, uuid)
    injectionKey = uuid
  }

  const [useProvideQueryBuilderStore, useConsumeQueryBuilderStore] = createStore(injectionKey)!

  return useConsumeQueryBuilderStore() ?? useProvideQueryBuilderStore(payload)
}

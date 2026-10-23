import { klona } from 'klona/full'

// Types
import type { IQueryBuilderProps } from '../types/query-builder-props.type'
import type { IQueryBuilderRow } from '../types/query-builder-row-props.type'
import type { IQueryBuilderItem } from '../types/query-builder-item-props.type'
import type { IQueryBuilderGroup } from '../types/query-builder-group-props.type'

export function useQueryBuilderColumnFilters(props: Pick<IQueryBuilderProps, 'columns'>) {
  const self = getCurrentInstance()

  // These are the actual filters we're working with in the query builder
  const columnFilters = ref<IQueryBuilderRow[]>([])

  // This only transforms the original filters to the `IQueryBuilderRow` format
  const columnFiltersArray = computed(() => {
    return props.columns
      .flatMap(column => column.filterDbQuery)
      .filter(filter => !filter.nonInteractive)
      .map(filter => {
        return {
          id: filter.id,
          field: filter.field,
          comparator: filter.comparator,
          value: filter.value ?? '',
          path: `column_filters.chidlren.${filter.id}`,
          dataType: filter.dataType,
          filterField: filter.filterField,
          isNotDraggable: true, // We don't want to drag the filters
          isNotDragOverable: true, // We don't want to drag the filters
          ref: filter,
        } as IQueryBuilderItem
      })
  })

  const hasColumnFilters = computed(() => {
    const firstGroup = columnFilters.value?.[0] as IQueryBuilderGroup

    if (!firstGroup) {
      return false
    }

    return firstGroup.children.length
  })

  /**
   * Returns the modified column filters
   *
   * NOTE: This only returns the interactive filters!
   */
  function getModifiedColumnFilters() {
    return props.columns
      .map(col => {
        const firstGroup = columnFilters.value[0] as IQueryBuilderGroup
        const _columnFilters = (firstGroup.children as IQueryBuilderItem[])
          .filter(f => f.field === col.field)

        return { field: col.field, filters: _columnFilters }
      })
  }

  /**
   * Returns the modified column filter(s)
   *
   * May return up to 2 columns - if we changed the `field`, it will return
   * both the old and the new column
   *
   * NOTE: This only returns the interactive filters!
   */
  function getModifiedColumnFilter(filter: IQueryBuilderItem) {
    const filterId = filter.id
    const firstGroup = columnFilters.value[0] as IQueryBuilderGroup

    if (!filter) {
      return []
    }

    const oldField = columnFiltersArray.value.find(f => f.id === filterId)?.field
    const newField = (firstGroup?.children as IQueryBuilderItem[])?.find(f => f.id === filterId)?.field

    if (!oldField || !newField) {
      return []
    }

    // Field didn't change, so we return just the updated filter
    if (oldField === newField) {
      const column = props.columns.find(col => col.field === newField)
      const columnFilterIdx = column?.filters.findIndex(f => f.id === filterId) ?? -1

      if (!column || columnFilterIdx === -1) {
        return []
      }

      return [
        {
          field: newField!,
          filters: column.filters.toSpliced(columnFilterIdx, 1, filter as any),
        },
      ]
    }

    // Otherwise, we return both the old and the new column
    const oldColumn = props.columns.find(col => col.field === oldField)
    const newColumn = props.columns.find(col => col.field === newField)

    if (!oldColumn || !newColumn) {
      return []
    }

    return [
      // New column
      { field: newField!, filters: [...newColumn?.filters, filter] },

      // Old column
      { field: oldField!, filters: oldColumn?.filters.filter(f => f.id !== filterId) },
    ]
  }

  function modifyColumnFilter(filter: IQueryBuilderItem) {
    const firstGroup = columnFilters.value[0] as IQueryBuilderGroup
    const columnFilter = (firstGroup?.children as IQueryBuilderItem[])?.find(f => f.id === filter.id)

    if (columnFilter) {
      columnFilter.field = filter.field
      columnFilter.comparator = filter.comparator
      columnFilter.value = filter.value

      self?.emit('update:columnFilter', columnFilter)
    }
  }

  function removeColumnFilter(filter: IQueryBuilderItem) {
    const firstGroup = columnFilters.value[0] as IQueryBuilderGroup
    firstGroup.children = firstGroup.children.filter(f => f.id !== filter.id)

    self?.emit('remove:columnFilter', filter)

    // const column = filter.misc?.column

    // if (!column) {
    //   return
    // }

    // column.filters = column.filters.filter(f => f.id !== filter.id)
  }

  watch(
    columnFiltersArray,
    filters => {
      columnFilters.value = [
        {
          id: Date.now(),
          children: klona(filters),
          condition: 'AND',
          isGroup: true,
          path: 'column_filters',
          isNotDraggable: true,
          isNotDragOverable: true,
        },
      ] as IQueryBuilderRow[]
    },
    { immediate: true },
  )

  return {
    columnFilters,
    hasColumnFilters,
    modifyColumnFilter,
    removeColumnFilter,
    getModifiedColumnFilters,
    getModifiedColumnFilter,
  }
}

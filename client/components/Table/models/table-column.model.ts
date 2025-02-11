import type { Required } from 'utility-types'
import type { CSSProperties } from 'vue'
import type { ExtendedDataType } from '$dataType'
import { ComparatorEnum } from '$comparatorEnum'
import { FilterItem, NON_VALUE_COMPARATORS, stringToFloat } from '$utils'

// Types
import type { ITableProps } from '../types/table-props.type'
import type { ITableSortItem } from '../types/table-sort-item.type'
import type { ITableFilterItem } from '../types/table-filter-item.type'
import type { ITableDistinctData } from '../types/table-distinct-data.type'

// Constants
import { DATE_TYPES } from '$utilsLayer/shared/types/datetime.type'
import { getDefaultComparatorByDataType } from '$utilsLayer/shared/constants/default-comparator-by-data-type.const'

// Functions
import { getComponentProps } from '../../../functions/get-component-props'
import { getDateSimpleValue } from '$utilsLayer/shared/composables/useDateUtils'
import { useRenderTemporaryTableCell } from '../composables/useRenderTemporaryTableCell'

// Components
import DynamicInput from '../../Inputs/DynamicInput/DynamicInput.vue'

export class TableColumn<T = IItem> {
  /**
   * The name of the column
   */
  name: string | number | Extract<keyof T, string | number>

  /**
   * Function to format the value of the column
   */
  format?: (row: T, value?: any) => any

  /**
   * The data type of the column
   */
  dataType: ExtendedDataType = 'string'

  /**
   * Label of the column
   */
  label?: string | (() => string)

  /**
   * Initial width of the column
   */
  width: string

  /**
   * The field to use for the column
   */
  field: ObjectKey<T>

  /**
   * When true, the column label will not be shown in the header
   */
  hideLabel?: boolean

  /**
   * Whether the column is filterable
   */
  filterable = true

  /**
   * Whether the column is reorderable
   */
  reorderable = true

  /**
   * Whether the column is resizable
   */
  resizable = true

  /**
   * Whether the column is sortable
   */
  sortable = true

  /**
   * Whether the column is local (ie. not part of the database)
   * As a result, when using this column, it will not be automatically added to the
   * fetch query
   */
  local?: boolean

  /**
   * When true, the column will always be visible in the table
   */
  alwaysVisible?: boolean

  /**
   * When provided, the `select` will be extended with these fields
   */
  needsFields?: string[]

  /**
   * When true, the column label will be shown in the help button in the
   * search input of the table
   *
   * @default false
   */
  searchable?: boolean

  /**
   * We might need to filter by a different field than the one displayed,
   * this property is used for that
   */
  filterField?: string

  /**
   * When true, the column will be not editable
   */
  noEdit?: boolean | ((row: T) => boolean)

  /**
   * When true, the column will be hidden in the table
   */
  hidden?: boolean

  /**
   * When true, the column will not be present in the column selection, query builder,
   * it will not be filterable or sortable, and will not be generally modifiable through UI
   *
   */
  nonInteractive?: boolean

  /**
   * The column's original width
   *
   * Is used to potentially reset the column's width
   *
   * NOTE: Do not set this manually
   */
  originalWidth: string

  /**
   * When true, the column will always be included in the `select` query
   *
   * Does not mean that it needs to be visible in the table!
   */
  alwaysSelected = false

  /**
   * When provided, the cell will contain a link to the provided route
   */
  link?: (row: T) => string | undefined | false

  /**
   * The link's props
   *
   * Usage: passing `target` or `rel` props to the link
   */
  linkProps?: Record<string, any>

  /**
   * The column's minimum width in px
   */
  minWidth?: number

  /**
   * When true, the column cannot be frozen
   *
   * NOTE: You probably don't want to set this manually
   */
  noFreeze?: boolean

  /**
   * Frozen columns are columns that are always visible
   *
   * NOTE: You probably don't want to set this manually
   */
  frozen?: boolean

  /**
   * If column is `semiFrozen` it means that it is not directly frozen but
   * it is part of a group of columns that are "before" the frozen column
   */
  semiFrozen?: boolean

  // Filtering
  /**
   * Currently used filters
   */
  filters: FilterItem<T>[] = []

  /**
   * Filters that will be merged with the ones from URL / saved meta
   */
  filtersPredefined?: FilterItem<T>[]

  /**
   * For some comparators, we should be using a specific component
   *
   * For example, when using `in` or `not.in` we should use a multi-select
   * with autocompletion and stuff
   */
  filterComponent?: {
    /**
     * The component to use for the filter
     */
    component: any

    /**
     * The props to pass to the component
     */
    props?: IItem | ((filterItem: ITableFilterItem, column: TableColumn) => IItem)

    /**
     * A set of comparators for which the filter should be used
     */
    comparators: ComparatorEnum[]

    /**
     * We can adjust how the value behaves when it's being edited
     */
    valueFormatter?: {
      getter: (value: any) => any
      setter: (value: any) => void
    }

    /**
     * The icon to use for the input
     */
    icon?: string

    /**
     * A debounce time for the filter trigger
     */
    debounceFilterTriggerMs?: number
  }

  /**
   * Usage: when we need to pass props to the "default" filter component
   */
  filterComponentProps?: IItem | ((filterItem: ITableFilterItem, column: TableColumn) => IItem)

  /**
   * The component to use for editing the actual value in the table
   */
  editComponent?: {
    component: any
    props?: Record<string, any>
    onSave?: (row: any, column?: TableColumn, originalRow?: any) => void
  }

  /**
   * The default component used for editing
   */
  get _editComponent() {
    if (this.editComponent) {
      return this.editComponent
    }

    return {
      component: markRaw(DynamicInput),
      props: { dataType: this.dataType },
    }
  }

  /**
   * The initial comparator
   */
  comparator = ComparatorEnum.STARTS_WITH

  /**
   * If used, these will be the only available comparators
   */
  comparators?: ComparatorEnum[]

  /**
   * These are comparators that will be added to the default ones
   */
  extraComparators?: ComparatorEnum[]

  /**
   * When filtering in the filter dropdown, we can use different formatting than in the table
   */
  filterFormat?: (row: T) => any

  /**
   * Clears all the filters
   */
  clearFilters() {
    this.filters = this.filters.filter(filter => !!filter.nonInteractive)
  }

  /**
   * Miscellanous data that can be used for anything
   */
  misc?: IItem

  /**
   * Function to inject the `filterDbQuery` getter to customize it
   */
  customDbQueryFnc?: (filterItem: FilterItem<T>, query: IItem) => IItem | undefined

  /**
   * Returns only the filters with a valid `comparator` and `value`
   */
  get filterDbQuery() {
    if (!this.filters.length) {
      return []
    }

    // Filter must have a comparator and value to be considered valid
    const validFilters = this.filters.filter(filter => {
      if (Array.isArray(filter.value)) {
        return filter.comparator && filter.value.length
      }
      const isNonValueComparator = NON_VALUE_COMPARATORS.includes(
        filter.comparator,
      )

      return filter.comparator && (!isNil(filter.value) || isNonValueComparator)
    })

    if (!validFilters.length) {
      return []
    }

    return validFilters
  }

  /**
   * Returns the `filteredKeys` for all the filters
   */
  get filteredKeys() {
    return this.filters.reduce((agg, filter) => {
      Object.assign(agg, filter.filteredKeys)

      return agg
    }, {})
  }

  // Sorting
  sort?: 'asc' | 'desc'

  /**
   * The sort order (for multi-sort)
   */
  sortOrder?: number

  /**
   * When merging columns from the state and the original table columns,
   * the state columns order should be preserved, this is used for that
   */
  _internalSort?: number

  /**
   * When sorting in the filter dropdown, we can use different formatting than in the table
   */
  sortFormat?: (row: T) => string | number | boolean

  get sortDbQuery(): ITableSortItem | undefined {
    if (!this.sort) {
      return undefined
    }

    return {
      field: this.field,
      direction: this.sort,
      sortOrder: this.sortOrder,
      filterField: this.filterField,
    }
  }

  /**
   * Function to get distinct data for the filter dropdown
   * Usage: For getting distinct values from the server
   */
  getDistinctData?: (
    col: TableColumn<T>
  ) => Promise<ITableDistinctData[]> | ITableDistinctData[]

  // Styling
  /**
   * Style applied to the header cell
   */
  headerStyle: CSSProperties = {}

  /**
   * Class applied to the header cell
   */
  headerClass?: ClassType

  /**
   * Class applied to the cell
   */
  cellClass?: ClassType | ((row: T) => ClassType)

  /**
   * Style applied to the cell
   */
  cellStyle: CSSProperties | ((row: T) => CSSProperties) = {}

  /**
   * Style applied to the totals cell
   */
  totalsCellStyle: CSSProperties = {}

  /**
   * Class applied to the totals cell
   */
  totalsCellClass?: ClassType

  // Helpers
  /**
   * Helper cols are non-data columns like selection checkboxes, groups, etc...
   *
   * NOTE: helper cols will not be ordered based on URL or schema
   */
  isHelperCol = false

  /**
   * When `false`, the autofit width will be calculated based on all the rows,
   * not just the longest in terms of text
   */
  autofitLongestText = true

  /**
   * Returns a "resolved" label
   *
   * ~ If `hideLabel` is `true`, it will return an empty string
   */
  get _label() {
    return this.hideLabel
      ? ''
      : typeof this.label === 'function' ? this.label() : (this.label ?? '')
  }

  /**
   * Gets the width in px (returns a number)
   */
  getWidth() {
    const el = document.querySelector(`[data-column="${this.field}"]`)

    if (!el) {
      return 0
    }

    const width = getComputedStyle(el).getPropertyValue('width')
    const widthPx = Number(stringToFloat(width) || 0)

    return widthPx
  }

  /**
   * Returns the width of the column in px
   *
   * NOTE: Do not set this manually
   */
  _width: number = 0

  setDataType(dataType?: ExtendedDataType, defaultComparator?: ComparatorEnum) {
    this.dataType = dataType || 'string'
    this.comparator = defaultComparator ?? getDefaultComparatorByDataType(dataType)
  }

  async autoFit(payload: {
    rows: any[]
    slotRenderFnc?: Function
    tableMinColWidth: number
    autofitConfig?: ITableProps['autoFit']
  }) {
    const { rows, slotRenderFnc, tableMinColWidth = 80, autofitConfig } = payload

    if (!this.resizable) {
      return
    }

    const {
      maxColumnWidthChars = 100,
      rowsLimit = 80,
      considerHeader = false,
    } = autofitConfig ?? getComponentProps('table').autoFit()
    const { getCellWidth } = useRenderTemporaryTableCell()

    let maxContentWidth = 0

    // We primarily use the row with the longest text to calculate the autofit width
    if (this.autofitLongestText) {
      // We get the row with the maximum content
      const maxContentRow = (rows || [])
        .slice(0, rowsLimit)
        .reduce(
          (agg, row) => {
            const cellValue = this.valueGetter(row)
            const cellFormattedValue = Array.isArray(cellValue)
              ? cellValue.map(val => this.format?.(row, val) || val).join(', ')
              : this.format?.(row, cellValue) || cellValue

            const labelChars = String(cellFormattedValue || '').length

            if (labelChars > agg.labelChars || !agg.labelChars) {
              agg.labelChars = labelChars
              agg.row = row
            }

            return agg
          },
          { labelChars: 0, row: undefined } as Record<string, any>,
        )

      maxContentWidth = await getCellWidth(
        maxContentRow.row,
        this,
        slotRenderFnc,
      )

      // We add a litle bit of tolerance
      maxContentWidth += 4
    }

    // When necessary, we can put `autofitLongestText = false` to calculate the
    // autofit width based on all the rows
    else {
      const _rows = (rows || []).slice(0, rowsLimit)

      for await (const row of _rows) {
        const width = await getCellWidth(row, this, slotRenderFnc)

        maxContentWidth = Math.max(maxContentWidth, width)
      }
    }

    const labelChars = this._label.length
    const colMinWidth = Math.min(
      Math.max(
        tableMinColWidth,
        this.minWidth || 0,
        considerHeader ? labelChars * 8 + 40 : 0, // These numbers are arbitrary
        maxContentWidth + 1, // + 1 for the border
      ),
      maxColumnWidthChars * 6 + 20, // When autofitting, we don't want to go over some predefined value
    )

    this.width = `${Math.ceil(colMinWidth)}px`
  }

  freeze(columns: TableColumn[]) {
    const isFrozen = this.frozen

    // We unfreeze any other frozen column
    columns.forEach(col => {
      col.frozen = false
      col.semiFrozen = false
      col.headerStyle = omit(this.headerStyle, ['left', 'position', 'backgroundColor', 'zIndex'])
      col.cellStyle = omit(this.cellStyle, ['left', 'position', 'backgroundColor', 'zIndex'])
    })

    if (!isFrozen) {
      // And we freeze the current column
      const colIdx = columns.findIndex(col => col.field === this.field)

      let left = 0
      columns.slice(0, colIdx + 1).forEach(col => {
        const colEl = document.querySelector(`[data-column="${col.field}"]`)
        const colWidthPx = colEl
          ? getComputedStyle(colEl).getPropertyValue('width')
          : '0px'

        col.width = colWidthPx
        const adjustedWidth = Number(stringToFloat(colWidthPx) ?? 0)

        col.semiFrozen = true
        col.headerStyle = {
          ...col.headerStyle,
          left: `${left}px`,
          position: 'sticky',
          backgroundColor: 'var(--color-theme)',
          zIndex: 1,
        }
        col.cellStyle = {
          ...col.cellStyle,
          left: `${left}px`,
          position: 'sticky',
          backgroundColor: 'var(--color-theme)',
          zIndex: 1,
        }

        left += adjustedWidth
      })

      this.frozen = true
    }
  }

  /**
   * Function that defines how do we access a value for this column
   * for a specific row
   */
  valueGetter(row: T) {
    return get(row, this.field) as any
  }

  constructor(col: Required<Partial<TableColumn<T>>, 'field'>) {
    this.name = col.name ?? col.field
    this.format = col.format
    this.filterable = col.filterable ?? true
    this.dataType = col.dataType ?? this.dataType
    this.label = col.label
    this.field = col.field
    this.filterField = col.filterField || this.field
    this.width = col.width || '40ch'
    this.originalWidth = col.originalWidth ?? this.width
    this.minWidth = col.minWidth
    this.hideLabel = col.hideLabel
    this.sortable = col.sortable ?? true
    this.searchable = col.searchable ?? false
    this.hidden = col.hidden ?? false
    this.alwaysSelected = col.alwaysSelected ?? false
    this.nonInteractive = col.nonInteractive
    this.link = col.link
    this.linkProps = col.linkProps
    this.noFreeze = col.noFreeze
    this.autofitLongestText = col.autofitLongestText ?? true
    this.needsFields = col.needsFields
    this.local = col.local ?? false
    this.alwaysVisible = col.alwaysVisible ?? false

    // Editing
    this.noEdit = col.noEdit
    this.editComponent = col.editComponent
    this.isHelperCol = col.isHelperCol ?? this.isHelperCol

    // Filtering
    this.filters = col.filters ? col.filters.map(f => new FilterItem(f)) : []
    this.filtersPredefined = col.filtersPredefined?.map(f => new FilterItem(f)) ?? []
    this.filterComponent = col.filterComponent
    this.comparators = col.comparators
    this.comparator = col.comparator || this.comparator
    this.extraComparators = col.extraComparators
    this.customDbQueryFnc = col.customDbQueryFnc
    this.filterFormat = col.filterFormat
    this.getDistinctData = col.getDistinctData
    this.valueGetter = col.valueGetter ?? this.valueGetter
    this.filterComponentProps = col.filterComponentProps ?? this.filterComponentProps

    this.reorderable = col.reorderable ?? this.reorderable
    this.resizable = col.resizable ?? this.resizable

    this.setDataType(col.dataType, col.comparator)

    // Sorting
    this.sort = col.sort
    this.sortOrder = col.sortOrder
    this.sortFormat = col.sortFormat
    this._internalSort = col._internalSort

    if (DATE_TYPES.includes(this.dataType) && !this.sortFormat) {
      this.sortFormat = (row: T) => {
        return getDateSimpleValue(get(row, this.field) as Datetime)
      }
    }

    // Styling
    this.cellClass = col.cellClass
    this.cellStyle = col.cellStyle || this.cellStyle
    this.headerStyle = col.headerStyle || this.headerStyle
    this.headerClass = col.headerClass
    this.totalsCellStyle = col.totalsCellStyle || this.totalsCellStyle
    this.totalsCellClass = col.totalsCellClass || 'flex-center'

    this.misc = col.misc
  }
}

import { ComparatorEnum } from '$comparatorEnum'
import { parseValue, SELECTOR_COMPARATORS } from '$utils'

// Types
import type { IQueryBuilderGroup } from '../../QueryBuilder/types/query-builder-group-props.type'
import type { IQueryBuilderItem } from '../../QueryBuilder/types/query-builder-item-props.type'
import type { IQueryBuilderRow } from '../../QueryBuilder/types/query-builder-row-props.type'

// Models
import type { TableColumn } from '../models/table-column.model'

// Functions

// Constants
import type { ITableProps } from '../types/table-props.type'

const AND_CONDITION = 'AND'
const OR_CONDITION = 'OR'
const NOT_AND_CONDITION = 'NOT_AND'
const NOT_OR_CONDITION = 'NOT_OR'

// Temporary variables
let columnsByField: Record<string, TableColumn<any>> = {}
let columnsByFilterField: Record<string, TableColumn<any>> = {}

/**
 * Will generate the appropriate path for the current row
 * The result will look like this: `0.children.1.children.2`
 */
function generatePath(parentPath: string, idx: number): string {
  return parentPath ? `${parentPath}.children.${idx}` : `${idx}`
}

function extractBracketContents(input: string): string[] {
  const pattern = /\[([^\]]+)\]/g
  const results: string[] = []
  let match: RegExpExecArray | null

  // Using a separate assignment and check loop
  match = pattern.exec(input)
  while (match !== null) {
    if (match[1]) {
      results.push(match[1])
    }
    match = pattern.exec(input) // Re-assign in the body of the loop
  }

  return results
}

/**
 * Extract the filter query parameter from URLSearchParams
 */
function extractFilterFromSearchParams(
  searchParams: URLSearchParams,
  key = 'filters',
  modifyFnc?: (queryString: string, key: string) => string,
): string | null {
  let paramsString = searchParams.get(key)

  if (!paramsString) {
    return null
  }

  paramsString = modifyFnc?.(paramsString, key) || paramsString

  return paramsString
}

/**
 * Check if the filter string at the curr\ent index represents a group condition.
 */
function isGroupCondition(filterStr: string, idx: number): boolean {
  return (
    filterStr.startsWith(NOT_AND_CONDITION.toLowerCase(), idx)
    || filterStr.startsWith(NOT_OR_CONDITION.toLowerCase(), idx)
    || filterStr.startsWith(AND_CONDITION.toLowerCase(), idx)
    || filterStr.startsWith(OR_CONDITION.toLowerCase(), idx)
  )
}

/**
 * Parse a group segment from the filter string.
 */
function parseGroupSegment(
  filterStr: string,
  idx: number,
  results: IQueryBuilderRow[],
  parentPath = '',
): number {
  const condition = filterStr[idx] === 'a' ? AND_CONDITION : OR_CONDITION
  const conditionEndIdx = idx + condition.length

  let openBrackets = 1
  let closeIdx = conditionEndIdx + 1

  while (openBrackets !== 0) {
    if (filterStr[closeIdx] === '(') {
      openBrackets++
    } else if (filterStr[closeIdx] === ')') {
      openBrackets--
    }

    closeIdx++
  }

  const groupContent = filterStr.slice(conditionEndIdx + 1, closeIdx - 1)
  const path = generatePath(parentPath, results.length)
  const group: IQueryBuilderGroup = {
    id: generateUUID(),
    path,
    condition,
    children: [],
    isGroup: true,
  }

  // We insert the group into the parent group if there is any parent
  if (parentPath) {
    const segments = path.split('.')
    const lastSegment = segments.pop()
    const parentGroup: any = get(results, segments.join('.'))

    if (lastSegment === 'children') {
      parentGroup.children.push(group)
    } else {
      results.push(group)
    }
  }

  // Otherwise, we insert the group into the results
  else {
    results.push(group)
  }

  parseFilterString(groupContent, group.children, path)

  return closeIdx
}

/**
 * Parse an item segment from the filter string.
 */
function parseItemSegment(
  filterStr: string,
  idx: number,
  results: IQueryBuilderRow[],
  parentPath = '',
): number {
  // Arrays are inserted into parentheses, therefore, we need to be aware
  // of the parentheses depth to know when the segment ends
  let parenthesesDepth = 0
  let endIdx = -1

  for (let i = idx; i < filterStr.length; i++) {
    if (filterStr[i] === '(') {
      parenthesesDepth++
    } else if (filterStr[i] === ')') {
      parenthesesDepth--
    } else if (filterStr[i] === ',' && parenthesesDepth === 0) {
      endIdx = i
      break
    }
  }

  const segment = endIdx === -1 ? filterStr.slice(idx) : filterStr.slice(idx, endIdx)

  const [
    field,
    comparator,
    value,
  ] = extractBracketContents(segment) as [ string, ComparatorEnum, string | undefined ]

  const col = columnsByFilterField[field] ?? columnsByField[field]
  const isComparator = Object.values(ComparatorEnum).includes(comparator)
  const isSelectorComparator = SELECTOR_COMPARATORS.includes(comparator)
  console.log('\n\n💀 And this is very fucking wrong')

  if (!isComparator) {
    throw new Error(`Invalid comparator: ${comparator}`)
  }

  const path = generatePath(parentPath, results.length)

  const _value
    = value?.startsWith('(') && value?.endsWith(')') && isSelectorComparator
      ? value.slice(1, -1).split(',')
      : value

  const parsedValue = Array.isArray(_value)
    ? _value.map(val => parseValue(val, col?.dataType))
    : parseValue(value, col?.dataType)

  const item: IQueryBuilderItem = {
    id: generateUUID(),
    path,
    field: col?.field ?? field,
    filterField: col?.filterField ?? field,
    comparator: comparator as ComparatorEnum,
    value: parsedValue,
  }

  results.push(item)

  return endIdx === -1 ? filterStr.length : endIdx + 1
}

/**
 * Recursively parse the filter string into structured data.
 */
function parseFilterString(
  filterStr: string,
  results: IQueryBuilderRow[] = [],
  parentPath = '',
): IQueryBuilderRow[] {
  let idx = 0

  while (idx < filterStr.length) {
    if (isGroupCondition(filterStr, idx)) {
      idx = parseGroupSegment(filterStr, idx, results, parentPath)
      // If next character is not '(' or end of string, assume it's a new segment.
      if (
        idx < filterStr.length
        && filterStr[idx] !== ','
        && filterStr[idx] !== '('
      ) {
        idx = parseItemSegment(filterStr, idx, results, parentPath)
      }
    } else {
      idx = parseItemSegment(filterStr, idx, results, parentPath)
      // Handle the case when there's no comma between segments.
      if (idx < filterStr.length && filterStr[idx] !== ',') {
        idx--
      }
    }

    if (idx < filterStr.length && filterStr[idx] === ',') {
      idx++
    }
  }
  return results
}

/**
 * Parses the filter query parameter from URLSearchParams into structured data
 */
function extractFilterPartFromUrl(payload: {
  searchParams: URLSearchParams
  key?: string
  columns?: TableColumn<any>[]
  modifiers?: ITableProps['modifiers']

  /**
   * The function that will be called before the query string is parsed
   */
  modifyFnc?: (queryString: string, key: string) => string
}): IQueryBuilderRow[] {
  const {
    searchParams,
    key = 'filters',
    columns = [],
    modifiers,
    modifyFnc,
  } = payload ?? {}

  const { caseInsensitive } = modifiers ?? {}

  // We save the columns in a temporary variable
  columnsByField = columns.reduce((agg, col) => {
    const colField = caseInsensitive ? String(col.field).toLowerCase() : col.field
    agg[colField] = col

    return agg
  }, {} as Record<string, TableColumn<any>>)

  columnsByFilterField = columns.reduce((agg, col) => {
    const colField = caseInsensitive ? String(col.filterField).toLowerCase() : col.filterField

    if (!colField) {
      return agg
    }

    agg[colField] = col

    return agg
  }, {} as Record<string, TableColumn<any>>)

  const filterQuery = extractFilterFromSearchParams(
    searchParams,
    key,
    modifyFnc,
  )

  return filterQuery ? parseFilterString(filterQuery) : []
}

export function tableExtractFiltersFromUrl(payload: {
  searchParams: URLSearchParams
  columns?: TableColumn<any>[]
  modifiers?: ITableProps['modifiers']

  /**
   * The function that will be called before the query string is parsed
   */
  modifyFnc?: (queryString: string, key: string) => string
}) {
  // Column filters
  const filters = extractFilterPartFromUrl({
    ...payload,
    key: 'filters',
  })

  // Query builder
  const queryBuilder = extractFilterPartFromUrl({
    ...payload,
    key: 'qb',
  })

  return {
    queryBuilder,
    filters,
  }
}

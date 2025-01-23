import type { InjectionKey } from 'vue'

/**
 * The table ID
 */
export const tableIdKey: InjectionKey<string> = Symbol('tableId')

/**
 * Refreshes table data (refetches them)
 */
export const tableRefreshKey: InjectionKey<(force?: boolean) => void> = Symbol('refreshTableData')

/**
 * The table slots
 */
export const tableSlotsKey: InjectionKey<Record<string, any>> = Symbol('tableSlots')

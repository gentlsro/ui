import type { InjectionKey } from 'vue'

/**
 * The table slots
 */
export const tableSlotsKey: InjectionKey<Record<string, any>> = Symbol('tableSlots')

import type { InjectionKey, Ref } from 'vue'

/**
 * The table slots
 */
export const tableSlotsKey: InjectionKey<Record<string, any>> = Symbol('tableSlots')

/**
 * Names of the table slots. Unlike the slots object itself this is reactive, so rows,
 * which render the consumer's cell slots directly, re-render when a slot is added or removed
 */
export const tableSlotNamesKey: InjectionKey<Ref<string[]>> = Symbol('tableSlotNames')

import type { InjectionKey, Ref } from 'vue'
import type { TableMeasurements } from '../composables/useRenderTemporaryTableCell'

/**
 * The table slots
 */
export const tableSlotsKey: InjectionKey<Record<string, any>> = Symbol('tableSlots')

/**
 * Names of the table slots. Unlike the slots object itself this is reactive, so rows,
 * which render the consumer's cell slots directly, re-render when a slot is added or removed
 */
export const tableSlotNamesKey: InjectionKey<Ref<string[]>> = Symbol('tableSlotNames')

/** Native measurement callbacks captured during the owning Table setup. */
export const tableMeasurementsKey: InjectionKey<TableMeasurements> = Symbol(
  'tableMeasurements',
)

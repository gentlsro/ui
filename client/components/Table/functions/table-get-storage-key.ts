import type { ComponentInternalInstance } from 'vue'
import type { ITableProps } from '../types/table-props.type'

/**
 * Gets the storage key (identifier) for the table
 *
 * NOTE: This needs to be used within vue context!
 */
export function tableGetStorageKey(
  propsStorageKey: ITableProps['storageKey'],
  instance?: ComponentInternalInstance | null,
) {
  return propsStorageKey ?? getComponentName(instance?.parent) ?? generateUUID()
}

import type { IUIConfig } from '../types/ui-config.type'
import type { IItem } from '#layers/utilities/app/types/item.type'

export function extendUIConfig<T extends Partial<IUIConfig> & IItem>(config: T): T {
  return config
}

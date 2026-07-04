import type { IUIConfig } from '../types/ui-config.type'

export function extendUIConfig<T extends Partial<IUIConfig> & IItem>(config: T): T {
  return config
}

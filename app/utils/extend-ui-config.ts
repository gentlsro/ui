import type { IUIConfig, UIConfigClasses } from '../types/ui-config.type'

export function extendUIConfig<T extends Partial<IUIConfig<UIConfigClasses['form']>> & IItem>(config: T): T {
  return config
}

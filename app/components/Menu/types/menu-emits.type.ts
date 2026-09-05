import type { IMenuProps } from './menu-props.type'
import type { Placement } from '@floating-ui/vue'

export type IMenuEmits = {
  (e: 'update:virtualDimensions', value: IMenuProps['virtualDimensions']): void
  (e: 'update:virtualConfig', value: IMenuProps['virtualConfig']): void
  (e: 'update:modelValue', val: boolean): void
  (e: 'hide'): void
  (e: 'show'): void
  (e: 'update:placement', placement: Placement): void
  (e: 'beforeHide'): void
  (e: 'beforeShow'): void
}

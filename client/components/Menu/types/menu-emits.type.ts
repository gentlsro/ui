import type { Placement } from '@floating-ui/vue'

export type IMenuEmits = {
  (e: 'update:modelValue', val: boolean): void
  (e: 'hide'): void
  (e: 'show'): void
  (e: 'update:placement', placement: Placement): void
  (e: 'beforeHide'): void
  (e: 'beforeShow'): void
}

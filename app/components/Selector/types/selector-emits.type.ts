export type ISelectorEmits = {
  (e: 'update:modelValue', val: any): void
  (e: 'update:options', val: any[]): void
  (e: 'add:item', item: any): void
  (e: 'remove:item', item: any): void
  (e: 'select:item', item: any): void
  (e: 'unselect:item', item: any): void
  (e: 'picker-hide'): void
  (e: 'picker-before-hide'): void
  (e: 'picker-show'): void
  (e: 'picker-before-show'): void
  (e: 'blur'): void
  (e: 'focus'): void
  (e: 'clear'): void
}

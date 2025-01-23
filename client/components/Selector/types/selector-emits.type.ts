export type ISelectorEmits = {
  (e: 'update:modelValue', val: any): void
  (e: 'update:options', val: any[]): void
  (e: 'added', item: any): void
  (e: 'removed', item: any): void
  (e: 'validation-reset', val?: string | undefined | null): void
  (e: 'picker-hide'): void
  (e: 'picker-before-hide'): void
  (e: 'picker-show'): void
  (e: 'picker-before-show'): void
  (e: 'blur'): void
  (e: 'focus'): void
}

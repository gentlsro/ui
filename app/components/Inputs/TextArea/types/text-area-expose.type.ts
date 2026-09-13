import type { FactoryOpts, InputMask } from 'imask'

export type ITextAreaExpose = {
  isTouched: () => boolean
  focus: (alignCursor?: boolean, preventScroll?: boolean) => void
  select: () => void
  blur: () => void
  clear: (shouldFocusAfterClear?: boolean) => void
  getInputElement: () => HTMLInputElement | HTMLTextAreaElement | undefined
  updateMask: (callback: (mask: InputMask<FactoryOpts>) => void) => void
}

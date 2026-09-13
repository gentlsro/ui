export type ITextInputExpose = {
  isTouched: () => boolean
  focus: (alignCursor?: boolean, preventScroll?: boolean) => void
  select: () => void
  blur: () => void
  clear: (shouldFocusAfterClear?: boolean) => void
  getInputElement: () => HTMLInputElement | HTMLTextAreaElement | undefined
  sync: (value: string | number | null | undefined) => void
}

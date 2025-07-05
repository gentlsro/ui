export type ITreeEmits<T extends IItem = IItem> = {
  (e: 'click:node', payload: { node: T, ev?: MouseEvent }): void
  (e: 'contextmenu:node', payload: { node: T, ev?: MouseEvent }): void
  (e: 'focus:node', payload: { node: T }): void
  (e: 'blur:node', payload: { node?: T }): void
}

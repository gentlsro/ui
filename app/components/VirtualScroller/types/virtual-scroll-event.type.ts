type VirtualItem = {
  index: number
  key: string
  size: number
}

export type IVirtualScrollEvent = {
  virtualStartItem?: VirtualItem
  virtualEndItem?: VirtualItem
  visibleStartItem: VirtualItem
  visibleEndItem: VirtualItem
}

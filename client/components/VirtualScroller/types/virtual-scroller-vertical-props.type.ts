import type { VirtualizerOptions } from '@tanstack/vue-virtual'

export type IVirtualScrollerVerticalProps<T extends IItem = IItem> = {
  /**
   * The data rows
   */
  rows: T[]

  /**
   * The height of each row
   *
   * NOTE: This acts as the minimum height - if the row content is taller,
   * the row will be adjusted automatically.
   */
  rowHeight?: number

  /**
   * The key to use for each row
   */
  rowKey?: keyof T

  /**
   * The options to pass to the virtualizer
   *
   * @see https://tanstack.com/virtual/latest/docs/api/virtualizer
   */
  virtualizerOptions?: Partial<Pick<
    VirtualizerOptions<HTMLDivElement, HTMLDivElement>,
  'overscan' | 'scrollMargin' | 'getScrollElement'
  >>
}

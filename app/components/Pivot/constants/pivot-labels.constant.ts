/** Texts the Pivot generates itself; the store supplies translated ones */
export type IPivotLabels = {
  /** The grand total row and column label */
  grandTotal: string

  /** The label of a group's subtotal row (word order differs between languages) */
  subtotal: (label: string) => string
}

export const PIVOT_DEFAULT_LABELS: IPivotLabels = {
  grandTotal: 'Grand Total',
  subtotal: label => `${label} Total`,
}

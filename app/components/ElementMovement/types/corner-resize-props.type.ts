// Types
import type { Corner } from './corner.type'

type CornerLimits = { min?: number, max?: number }

export type ICornerResizeProps = {
/**
 * Corner values object where keys are corners and values are numbers
 */
  modelValue?: Partial<Record<Corner, number>>

  /**
   * Limits for each corner
   */
  limits?: Partial<Record<Corner, CornerLimits>>

  /**
   * Step size for value changes (snaps to nearest multiple)
   */
  step?: number

  /**
   * Invert resize behavior for corners. Can be:
   * - true: invert all corners
   * - Partial<Record<Corner, boolean>>: specify per corner
   */
  inverted?: boolean | Partial<Record<Corner, boolean>>

  /**
   * The reference element will be used for positioning
   */
  referenceEl?: any
}

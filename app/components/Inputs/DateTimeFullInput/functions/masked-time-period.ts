import { MaskedEnum, MaskedPattern } from 'imask'
import type { TailDetails } from 'imask'

/**
 * IMask's `MaskedEnum` drops its tail, so it clears the AM/PM whenever anything
 * before it changes – typing a new day, hour or minute. The period is always a
 * complete enum value (`MaskedEnum` completes it on input), so extract the tail
 * the way `MaskedPattern` does for the other nested blocks and IMask re-appends
 * it after the edit.
 */
export class MaskedTimePeriod extends MaskedEnum {
  override extractTail(fromPos = 0, toPos = this.displayValue.length): TailDetails {
    return MaskedPattern.prototype.extractTail.call(this, fromPos, toPos)
  }
}

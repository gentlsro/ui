import { MaskedRange } from 'imask'
import type { AppendFlags, MaskedPatternState } from 'imask'

/** Pad new input without correcting existing digits moved during an edit. */
export class MaskedDateRange extends MaskedRange {
  override _appendCharRaw(char: string, flags: AppendFlags<MaskedPatternState> = {}) {
    const autofix = this.autofix

    // IMask re-appends the surviving suffix as a tail after insertions and
    // deletions. Range autofix would rewrite those digits (e.g. 2026 → 196Y).
    if (flags.tail) {
      this.autofix = false
    }

    try {
      return super._appendCharRaw(char, flags)
    } finally {
      this.autofix = autofix
    }
  }
}

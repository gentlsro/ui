/**
 * Validation results are recognised by shape, not by `instanceof`, so the
 * store never imports ArkType or Zod. Schemas carry their own runtime; the
 * libraries load with the first schema that is built.
 */

/** One leaf error as ArkType exposes it (`path`, `message`, `problem`, `code`). */
export type IArkLikeError = {
  path: readonly PropertyKey[]
  message: string
  problem?: string
  code?: string
  /** Union errors expand to their branches; simple errors to themselves. */
  flat?: readonly IArkLikeError[]
}

/** ArkType's `ArkErrors`: an array of errors that also indexes them by path. */
export type IArkLikeErrors = readonly IArkLikeError[] & { byPath: Record<string, IArkLikeError> }

export type IZodLikeFailure = {
  success: false
  error: { issues: readonly { path: readonly PropertyKey[], message: string }[] }
}

export function isArkErrors(result: unknown): result is IArkLikeErrors {
  return Array.isArray(result) && 'byPath' in result
}

export function isZodFailure(result: unknown): result is IZodLikeFailure {
  return typeof result === 'object'
    && result !== null
    && 'success' in result
    && result.success === false
    && 'error' in result
    && typeof result.error === 'object'
    && result.error !== null
    && 'issues' in result.error
    && Array.isArray(result.error.issues)
}

/** Every leaf error of an ArkType result, union branches expanded. */
export function flattenArkErrors(errors: IArkLikeErrors): IArkLikeError[] {
  return errors.flatMap(error => error.flat ?? [error])
}

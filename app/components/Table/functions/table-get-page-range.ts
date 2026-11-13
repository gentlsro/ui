/**
 * Gets the 1-based range of rows displayed on the current page (`from` - `to`)
 * When there are no rows, the range is `0 - 0`
 */
export function tableGetPageRange(payload: {
  currentPage: number
  pageSize: number
  rowsCount: number
}) {
  const { currentPage, pageSize, rowsCount } = payload

  if (!rowsCount) {
    return { from: 0, to: 0 }
  }

  const skip = (Math.max(currentPage, 1) - 1) * pageSize

  return {
    from: skip + 1,
    to: skip + rowsCount,
  }
}

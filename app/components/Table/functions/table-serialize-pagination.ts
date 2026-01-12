export function tableSerializePagination(payload: {
  skip: number
  take: number
}) {
  const { skip, take } = payload

  return {
    skip: skip.toString(),
    take: take.toString(),
  }
}

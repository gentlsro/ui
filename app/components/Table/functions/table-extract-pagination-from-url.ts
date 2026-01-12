export function tableExtractPaginationFromUrl(params: URLSearchParams) {
  const skip = params.get('skip') ?? '0'
  const take = params.get('take') ?? '0'

  return {
    skip: Number.parseInt(skip ?? 0),
    take: Number.parseInt(take ?? 0),
  }
}

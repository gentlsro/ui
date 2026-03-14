export function tableExtractPaginationFromUrl(params: URLSearchParams) {
  const skip = params.get('skip')
  const take = params.get('take')

  return {
    skip: isNil(skip) ? undefined : Number.parseInt(skip ?? 0),
    take: isNil(take) ? undefined : Number.parseInt(take ?? 0),
  }
}

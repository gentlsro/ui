export function getPivotPathId(path: string[]) {
  return path.map(part => encodeURIComponent(part)).join('/')
}

export function pivotGroupBy<T>(items: T[], field: ObjectKey<T>): Map<string, T[]> {
  const map = new Map<string, T[]>()

  for (const item of items) {
    const key = String(get(item, field) ?? '')
    const group = map.get(key)

    if (group) {
      group.push(item)
    } else {
      map.set(key, [item])
    }
  }

  return map
}

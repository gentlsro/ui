/** Resolve the data-provider name without importing an icon rendering component. */
export function resolveRuntimeIconName(name: string, options: {
  aliases?: Record<string, string>
  collections?: string[] | null
  customCollections?: string[] | null
  cssSelectorPrefix?: string
}) {
  const collections = [...options.collections ?? [], ...options.customCollections ?? []]
    .toSorted((left, right) => right.length - left.length)
  const prefix = options.cssSelectorPrefix ?? 'i-'
  // A custom collection can itself start with `i-`. Registered canonical names
  // take precedence over interpreting that prefix as a legacy CSS marker.
  const registered = name.includes(':') && collections.includes(name.split(':')[0]!)
  const bare = !registered && name.startsWith(prefix) ? name.slice(prefix.length) : name
  const resolved = options.aliases?.[bare] ?? bare
  const collection = !resolved.includes(':') && collections.find(item => resolved.startsWith(`${item}-`))
  const canonical = collection ? `${collection}:${resolved.slice(collection.length + 1)}` : resolved

  return /^[a-z0-9][a-z0-9-]*:[a-z0-9][\w-]*$/i.test(canonical) ? canonical : undefined
}

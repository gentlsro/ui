function recursivelyBuildHierarchy<T extends IItem = IItem>(payload: {
  item: T
  itemsById: Map<string | number, T>
  idKey?: string
  childrenKey?: string
  parentKey?: string
}): T {
  const { item, itemsById, idKey = 'id', childrenKey = 'children', parentKey = 'parentId' } = payload

  const itemId = get(item, idKey)
  const children = Array.from(itemsById.values()).filter(
    childItem => get(childItem, parentKey) === itemId && childItem !== item,
  )

  // Recursively build hierarchy for each child
  const childrenHierarchy = children.map(child =>
    recursivelyBuildHierarchy({
      item: child,
      itemsById,
      childrenKey,
      parentKey,
      idKey,
    }),
  )

  // Attach children to the item using childrenKey
  set(item, childrenKey, childrenHierarchy)

  return item
}

export function createHierarchyFromItems<T extends IItem = IItem>(payload: {
  items: T[]
  childrenKey?: string
  parentKey?: string
  idKey?: string
}) {
  const { items, childrenKey = 'children', parentKey = 'parentId', idKey = 'id' } = payload

  if (items.length === 0) {
    return []
  }

  // Create a map of items by their id for efficient lookup
  const itemsById = new Map<string | number, T>()
  items.forEach(item => {
    const id = get(item, idKey)
    if (id !== undefined && id !== null) {
      itemsById.set(id, item)
    }
  })

  // Find root items: items where parentKey is null, undefined, or doesn't match any item's id
  const rootItems = items.filter(item => {
    const parentId = get(item, parentKey)

    return isNil(parentId) || !itemsById.has(parentId)
  })

  // Recursively build hierarchy for each root item
  const hierarchy = rootItems.map(rootItem =>
    recursivelyBuildHierarchy({
      item: rootItem,
      itemsById,
      childrenKey,
      parentKey,
      idKey,
    }),
  )

  return hierarchy
}

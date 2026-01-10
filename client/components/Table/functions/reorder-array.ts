export function reorderArray<T extends IItem = IItem>(
  arr1: T[],
  arr2: T[],
  options: {
    isMovable: (item: T) => boolean
    isSameField: (a: T, b: T) => boolean
  },
): T[] {
  const { isMovable, isSameField } = options

  // 1. Collect all movable items from arr1
  const movableFromArr1 = arr1.filter(isMovable)

  // 2. Build the final movable list in the order of arr2, then leftover movable
  //    We'll find matches in 'arr2' by comparing 'field'.
  const finalMovableOrder: T[] = []
  for (const item2 of arr2) {
    const match = movableFromArr1.find(item1 => isSameField(item1, item2))

    if (match) {
      finalMovableOrder.push(match)
    }
  }
  // If there are still some movable items from arr1 not in arr2, append them after
  for (const item1 of movableFromArr1) {
    if (!finalMovableOrder.some(m => isSameField(m, item1))) {
      finalMovableOrder.push(item1)
    }
  }

  // 3. Rebuild arr1: if movable, pop the next from finalMovableOrder; else keep in place
  let movableIndex = 0

  return arr1.map(item => {
    if (isMovable(item)) {
      const next = finalMovableOrder[movableIndex++]
      return next
    }

    return item
  }) as T[]
}

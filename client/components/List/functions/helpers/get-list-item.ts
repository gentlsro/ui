export function getListItem(itemOrId: any, itemByKey: Record<string, IItem>) {
  return typeof itemOrId === 'object' ? itemOrId : itemByKey[itemOrId]
}

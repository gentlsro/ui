export function getListItemKey(itemOrId: any, itemKey: string): string {
  return typeof itemOrId === 'object' ? get(itemOrId, itemKey) : itemOrId
}

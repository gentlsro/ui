export function handleItemDrop<T extends IItem>(payload: {
  item: ProcessedItem
  file?: File
  fileKey?: string
  folderKey?: string
}): T {
  const { item, file, fileKey, folderKey } = payload

  const isFile = 'type' in item

  if (isFile) {
    return {
      id: generateUUID(),
      type: fileKey,
      name: item.name,
      file,
      children: [],
    } as unknown as T
  } else {
    return {
      id: generateUUID(),
      type: folderKey,
      name: item.name,
      children: [],
    } as unknown as T
  }
}

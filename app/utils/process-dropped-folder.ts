// NOTE: Completely vibe-coded

// Add type definitions for missing browser APIs
declare global {
  interface DataTransferItem {
    getAsFileSystemHandle?: () => Promise<FileSystemHandle>
  }

  interface FileSystemDirectoryHandle extends FileSystemHandle {
    values: () => AsyncIterableIterator<FileSystemHandle>
  }
}

type FileInfo = {
  name: string
  type: string
  size: number
  content?: string | ArrayBuffer | null // Optional: File content
}

export type DirectoryInfo = {
  name: string
  files: FileInfo[]
  directories: DirectoryInfo[]
}

export type ProcessedItem = FileInfo | DirectoryInfo

type ItemCallback = (item: ProcessedItem, parentItem?: DirectoryInfo, file?: File) => void | Promise<void>

/**
 * Processes dropped items (files and/or folders) and calls a callback for each processed item.
 *
 * @param {DataTransferItemList} items The DataTransferItemList from the drop event.
 * @param {ItemCallback} onItemProcessed Callback function called for each processed file/folder.
 * @returns {Promise<ProcessedItem[]>} A promise that resolves to an array of processed items.
 * @throws {Error} If there's an error accessing the file system or reading files.
 */
export async function processDroppedItems(
  items: DataTransferItemList,
  onItemProcessed: ItemCallback,
): Promise<ProcessedItem[]> {
  const processedItems: ProcessedItem[] = []

  // First, collect all entries before processing them
  // This is important because DataTransferItem objects can become invalid after being accessed
  const entries: (FileSystemEntry | FileSystemHandle)[] = []
  const asyncHandles: { index: number, item: DataTransferItem }[] = []

  // First pass: collect synchronous entries (webkitGetAsEntry) and identify async ones
  for (let i = 0; i < items.length; i++) {
    const item = items[i]

    // Check if item exists
    if (!item) {
      continue
    }

    // Check if it's a file/directory (not a string or other type)
    if (item.kind !== 'file') {
      continue
    }

    try {
      let entry: FileSystemEntry | FileSystemHandle | null = null

      // Try synchronous method first (legacy API)
      if (item.webkitGetAsEntry) {
        entry = item.webkitGetAsEntry()

        if (entry) {
          entries.push(entry)
        }
      }
      // If webkitGetAsEntry is not available or didn't work, try the modern async API
      else if (item.getAsFileSystemHandle) {
        asyncHandles.push({ index: i, item })
      }
    } catch (err) {
      console.error('Error accessing dropped item:', err)
      // Continue with other items instead of throwing
    }
  }

  // Second pass: handle async FileSystemHandle API
  for (const { index, item } of asyncHandles) {
    try {
      if (!item.getAsFileSystemHandle) {
        continue
      }

      const entry = await item.getAsFileSystemHandle()

      if (entry) {
        entries.push(entry)
      }
    } catch (err) {
      console.error(`Error with getAsFileSystemHandle for item ${index}:`, err)
    }
  }

  // Now process all collected entries
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i]
    if (!entry) {
      continue
    }

    try {
      const processedItem = await processEntryWithCallback(entry, onItemProcessed)
      processedItems.push(processedItem)
    } catch (err) {
      console.error('Error processing dropped item:', err)
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      throw new Error(`Error processing dropped item: ${errorMessage}`)
    }
  }

  return processedItems
}

async function processEntryWithCallback(
  entry: FileSystemEntry | FileSystemHandle,
  onItemProcessed: ItemCallback,
  parentItem?: DirectoryInfo,
): Promise<ProcessedItem> {
  // Type guard for FileSystemHandle vs FileSystemEntry
  const isFile = 'kind' in entry
    ? entry.kind === 'file'
    : (entry as FileSystemEntry).isFile

  if (isFile) {
    const { fileInfo, file } = await processFileWithCallback(entry as FileSystemFileEntry | FileSystemFileHandle)
    await onItemProcessed(fileInfo, parentItem, file)
    return fileInfo
  } else {
    const directoryInfo = await processDirectoryWithCallback(
      entry as FileSystemDirectoryEntry | FileSystemDirectoryHandle,
      onItemProcessed,
      parentItem,
    )
    return directoryInfo
  }
}

async function processDirectoryWithCallback(
  directoryEntry: FileSystemDirectoryEntry | FileSystemDirectoryHandle,
  onItemProcessed: ItemCallback,
  parentItem?: DirectoryInfo,
): Promise<DirectoryInfo> {
  const directoryInfo: DirectoryInfo = {
    name: directoryEntry.name,
    files: [],
    directories: [],
  }

  // Call callback for the directory itself
  await onItemProcessed(directoryInfo, parentItem)

  if ('values' in directoryEntry) {
    // FileSystemDirectoryHandle (modern)
    const directoryHandle = directoryEntry as FileSystemDirectoryHandle
    for await (const entry of directoryHandle.values()) {
      const childInfo = await processEntryWithCallback(entry, onItemProcessed, directoryInfo)

      // Type guard to determine if it's a file or directory
      if ('type' in childInfo) {
        // It's a FileInfo
        directoryInfo.files.push(childInfo as FileInfo)
      } else {
        // It's a DirectoryInfo
        directoryInfo.directories.push(childInfo as DirectoryInfo)
      }
    }
  } else {
    // FileSystemDirectoryEntry (legacy)
    const directoryReader = (directoryEntry as FileSystemDirectoryEntry).createReader()

    async function readEntries(): Promise<void> {
      return new Promise<void>((resolve, reject) => {
        directoryReader.readEntries(
          async entries => {
            if (entries.length === 0) {
              resolve() // No more entries
              return
            }

            for (const entry of entries) {
              try {
                const childInfo = await processEntryWithCallback(entry, onItemProcessed, directoryInfo)
                if (entry.isFile) {
                  directoryInfo.files.push(childInfo as FileInfo)
                } else {
                  directoryInfo.directories.push(childInfo as DirectoryInfo)
                }
              } catch (error) {
                reject(error) // Reject if any entry processing fails
                return
              }
            }

            // Continue reading entries recursively
            try {
              await readEntries()
              resolve() // Resolve after all entries are processed
            } catch (error) {
              reject(error)
            }
          },
          error => {
            reject(error)
          },
        )
      })
    }

    await readEntries()
  }

  return directoryInfo
}

/**
 * Processes a dropped folder and returns a structured representation of its contents.
 *
 * @param {DataTransferItemList} items The DataTransferItemList from the drop event.
 * @returns {Promise<DirectoryInfo[]>} A promise that resolves to an array of DirectoryInfo objects,
 *                                     representing the folder structure.  Returns an empty array if no folders are dropped.
 * @throws {Error} If there's an error accessing the file system or reading files.
 */
export async function processDroppedFolder(items: DataTransferItemList): Promise<DirectoryInfo[]> {
  const rootDirectories: DirectoryInfo[] = []

  // First, collect all entries before processing them
  // This is important because DataTransferItem objects can become invalid after being accessed
  const entries: (FileSystemEntry | FileSystemHandle)[] = []

  for (let i = 0; i < items.length; i++) {
    const item = items[i]

    // Check if item exists
    if (!item) {
      continue
    }

    try {
      let entry: FileSystemEntry | FileSystemHandle | null = null

      if (item.getAsFileSystemHandle) {
        entry = await item.getAsFileSystemHandle()
      } else if (item.webkitGetAsEntry) {
        entry = item.webkitGetAsEntry()
      }

      if (entry) {
        entries.push(entry)
      }
    } catch (err) {
      console.error('Error accessing dropped item:', err)
      // Continue with other items instead of throwing
    }
  }

  // Now process all collected entries
  for (const entry of entries) {
    try {
      // Type guard for FileSystemHandle vs FileSystemEntry
      const isFile = 'kind' in entry
        ? entry.kind === 'file'
        : (entry as FileSystemEntry).isFile

      if (isFile) {
        console.warn('Unexpected file at the root level.  Expected a directory.')
        // Handle the case where a file is dropped directly instead of a folder.
        // You might want to create a single-element DirectoryInfo for it, or throw an error.
        // For now, we'll just skip it.
        continue
      }

      const directoryInfo = await processDirectory(entry as FileSystemDirectoryEntry | FileSystemDirectoryHandle)
      rootDirectories.push(directoryInfo)
    } catch (err) {
      console.error('Error processing dropped item:', err)
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      throw new Error(`Error processing dropped item: ${errorMessage}`) // Re-throw for the caller to handle
    }
  }

  return rootDirectories
}

async function processEntry(entry: FileSystemEntry | FileSystemHandle): Promise<DirectoryInfo | FileInfo> {
  // Type guard for FileSystemHandle vs FileSystemEntry
  const isFile = 'kind' in entry
    ? entry.kind === 'file'
    : (entry as FileSystemEntry).isFile

  if (isFile) {
    return processFile(entry as FileSystemFileEntry | FileSystemFileHandle)
  } else {
    return processDirectory(entry as FileSystemDirectoryEntry | FileSystemDirectoryHandle)
  }
}

async function processFileWithCallback(fileEntry: FileSystemFileEntry | FileSystemFileHandle): Promise<{ fileInfo: FileInfo, file: File }> {
  let file: File

  if ('getFile' in fileEntry) {
    file = await fileEntry.getFile() // FileSystemFileHandle
  } else {
    file = await new Promise<File>((resolve, reject) => {
      (fileEntry as FileSystemFileEntry).file(resolve, reject) // FileSystemFileEntry
    })
  }

  const fileInfo: FileInfo = {
    name: file.name,
    type: file.type,
    size: file.size,
  }

  // Optional: Read the file content (e.g., as text)
  // try {
  //   fileInfo.content = await readFileContent(file, 'text'); // Or 'dataURL', 'arrayBuffer'
  // } catch (error) {
  //   console.error(`Error reading file content for ${file.name}:`, error);
  //   // Handle the error appropriately (e.g., set fileInfo.content to null or a default value)
  //   fileInfo.content = null;
  // }

  return { fileInfo, file }
}

async function processFile(fileEntry: FileSystemFileEntry | FileSystemFileHandle): Promise<FileInfo> {
  const { fileInfo } = await processFileWithCallback(fileEntry)
  return fileInfo
}

async function processDirectory(directoryEntry: FileSystemDirectoryEntry | FileSystemDirectoryHandle): Promise<DirectoryInfo> {
  const directoryInfo: DirectoryInfo = {
    name: directoryEntry.name,
    files: [],
    directories: [],
  }

  if ('values' in directoryEntry) {
    // FileSystemDirectoryHandle (modern)
    const directoryHandle = directoryEntry as FileSystemDirectoryHandle
    for await (const entry of directoryHandle.values()) {
      const childInfo = await processEntry(entry)

      // Type guard to determine if it's a file or directory
      if ('type' in childInfo) {
        // It's a FileInfo
        directoryInfo.files.push(childInfo as FileInfo)
      } else {
        // It's a DirectoryInfo
        directoryInfo.directories.push(childInfo as DirectoryInfo)
      }
    }
  } else {
    // FileSystemDirectoryEntry (legacy)
    const directoryReader = (directoryEntry as FileSystemDirectoryEntry).createReader()

    async function readEntries(): Promise<void> {
      return new Promise<void>((resolve, reject) => {
        directoryReader.readEntries(
          async entries => {
            if (entries.length === 0) {
              resolve() // No more entries
              return
            }

            for (const entry of entries) {
              try {
                const childInfo = await processEntry(entry)
                if (entry.isFile) {
                  directoryInfo.files.push(childInfo as FileInfo)
                } else {
                  directoryInfo.directories.push(childInfo as DirectoryInfo)
                }
              } catch (error) {
                reject(error) // Reject if any entry processing fails
                return
              }
            }

            // Continue reading entries recursively
            try {
              await readEntries()
              resolve() // Resolve after all entries are processed
            } catch (error) {
              reject(error)
            }
          },
          error => {
            reject(error)
          },
        )
      })
    }

    await readEntries()
  }

  return directoryInfo
}

// Optional: Function to read file content
async function readFileContent(file: File, type: 'text' | 'dataURL' | 'arrayBuffer'): Promise<string | ArrayBuffer | null> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      resolve(reader.result)
    }

    reader.onerror = () => {
      reject(reader.error)
    }

    switch (type) {
      case 'text':
        reader.readAsText(file)
        break
      case 'dataURL':
        reader.readAsDataURL(file)
        break
      case 'arrayBuffer':
        reader.readAsArrayBuffer(file)
        break
      default:
        reject(new Error(`Unsupported file reading type: ${type}`))
    }
  })
}

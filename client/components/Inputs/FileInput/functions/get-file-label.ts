// Types
import type { IFile } from '$utils/shared/types/file.type'

// Models
import { FileModel } from '$utils/shared/models/file.model'

export function getFileLabel(file: FileModel | IFile) {
  const { formatBytes } = useNumber()
  const size = file instanceof FileModel ? file.file.size : file.size

  return `${file.name} (${formatBytes(size ?? 0)})`
}

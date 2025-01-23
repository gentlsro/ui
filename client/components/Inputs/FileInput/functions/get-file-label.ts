// Models
import { FileModel } from '$utils'

export function getFileLabel(file: FileModel | IFile) {
  const { formatBytes } = useNumber()
  const size = file instanceof FileModel ? file.file.size : file.size

  return `${file.name} (${formatBytes(size ?? 0)})`
}

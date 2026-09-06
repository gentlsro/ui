export function getFileLabel(
  file: File | FileModel | IFile,
  formatBytes: (bytes: number) => string,
) {
  const size = file instanceof FileModel ? file.file.size : file.size

  return `${file.name} (${formatBytes(size ?? 0)})`
}

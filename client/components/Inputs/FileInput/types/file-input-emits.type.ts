import type { FileModel } from '$utils'

export type ITableEmits = {
  (e: 'focus'): void
  (e: 'blur'): void
  (e: 'filesAdded', files: FileModel[]): void
  (e: 'filesRemoved', files: FileModel[]): void
}

// Types
import type { IFileInputProps } from '../types/file-input-props.type'

// Models
import { FileModel } from '$utils'

// Components
import type Field from '../../../Field/Field.vue'

export function useFileInput(payload: {
  model: Ref<IFileInputProps['modelValue']>
  props: IFileInputProps
}) {
  const { model, props } = payload

  // Utils
  const self = getCurrentInstance()

  // Layout
  const fileFieldEl = ref<InstanceType<typeof Field>>()

  // File dialog
  const { open, onChange, reset } = useFileDialog({
    accept: props.accept,
    multiple: props.multi,
  })

  const { isOverDropZone } = useDropZone(
    () => unrefElement(fileFieldEl as any),
    handleAddFile,
  )

  function handleAddFile(files: FileList | File[] | null) {
    if (!files) {
      return
    }

    const filesArray = Array.from(files).map(file => new FileModel({ file }))

    if (props.multi) {
      model.value = [...(model.value || []), ...filesArray]
    } else {
      model.value = filesArray
    }

    self?.emit('filesAdded', filesArray)

    reset()
  }

  function handleRemoveFile(idx: number) {
    if (!model.value) {
      return
    }

    self?.emit('filesRemoved', [model.value[idx]])
    model.value = model.value.toSpliced(idx, 1)
  }

  onChange(handleAddFile)

  return {
    fileFieldEl,
    model,
    isOverDropZone,
    handleAddFile,
    handleRemoveFile,
    openFileDialog: open,
  }
}

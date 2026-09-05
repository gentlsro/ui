// Types
import type { IFileInputProps } from '../types/file-input-props.type'
import type { IFileInputEmits } from '../types/file-input-emits.type'

// Components
import type Field from '../../../Field/Field.vue'

export function useFileInput(payload: {
  model: Ref<IFileInputProps['modelValue']>
  props: IFileInputProps
  emit: IFileInputEmits
}) {
  const { model, props, emit } = payload

  // Layout
  const fileFieldEl = ref<InstanceType<typeof Field>>()

  // File dialog
  const { open, onChange, reset } = useFileDialog({
    accept: props.accept,
    multiple: props.multi,
  })

  const { isOverDropZone } = useDropZone(
    () => fileFieldEl.value?.element,
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

    emit('filesAdded', filesArray)

    reset()
  }

  function handleRemoveFile(idx: number | string) {
    if (!model.value) {
      return
    }

    emit('filesRemoved', [model.value[Number(idx)]])
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

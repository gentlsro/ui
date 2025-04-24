<script setup lang="ts">
// Types
import type { ITableEmits } from './types/file-input-emits.type'
import type { IFileInputProps } from './types/file-input-props.type'

// Functions
import { useFileInput } from './functions/useFileInput'
import { useFieldUtils } from '../../Field/functions/useFieldUtils'
import { getComponentMergedProps, getComponentProps } from '../../../functions/get-component-props'

const props = withDefaults(defineProps<IFileInputProps>(), {
  ...getComponentProps('fileInput'),
})

defineEmits<ITableEmits>()

// Utils
const { getFieldProps } = useFieldUtils()

// Layout
const model = defineModel<IFileInputProps['modelValue']>({ default: () => [] })

const {
  fileFieldEl,
  isOverDropZone,
  handleRemoveFile,
  openFileDialog,
} = useFileInput({ model, props })

const mergedProps = computed(() => {
  return getComponentMergedProps('fileInput', props)
})

// Layout
const fieldProps = getFieldProps(props)
</script>

<template>
  <Field
    ref="fileFieldEl"
    v-bind="fieldProps"
    :ui="mergedProps.ui"
    :model-value="model"
    has-content
    class="file-input"
    :class="{ 'dragged-over': isOverDropZone }"
  >
    <slot
      :open-file-dialog
      :is-over-drop-zone
      :remove-file="handleRemoveFile"
    >
      <FileInputInner
        v-bind="$props"
        :ui="mergedProps.ui"
        :model-value="model"
        :file-remove-fnc="handleRemoveFile"
        :open-file-dialog
      />
    </slot>

    <slot
      name="empty"
      :open-file-dialog
      :is-over-drop-zone
    >
      <FileInputEmpty v-if="!multi && !model?.length" />
    </slot>
  </Field>
</template>

<style lang="scss" scoped>
.file-input {
  @apply min-w-50;
}
</style>

<script setup lang="ts">
// Types
import type { IFileInputProps } from './types/file-input-props.type'

// Functions
import { useFileInput } from './functions/useFileInput'
import { useFieldUtils } from '../../Field/functions/useFieldUtils'
import { getComponentMergedProps, getComponentProps } from '../../../functions/get-component-props'

const props = withDefaults(defineProps<IFileInputProps>(), {
  ...getComponentProps('fileInputSimple'),
})

defineEmits<{
  (e: 'focus'): void
  (e: 'blur'): void
}>()

// Utils
const { el, getFieldProps, handleFocusOrClick } = useFieldUtils({
  props,
  onFocus: handleOpenDialog,
})

// Layout
const model = defineModel<IFileInputProps['modelValue']>({ default: () => [] })

const {
  fileFieldEl,
  isOverDropZone,
  handleRemoveFile,
  openFileDialog,
} = useFileInput({ model, props })

const mergedProps = computed(() => {
  return getComponentMergedProps('fileInputSimple', props)
})

// Layout
const fieldProps = getFieldProps(props)

function handleOpenDialog(ev?: PointerEvent | FocusEvent) {
  if (!(ev instanceof FocusEvent)) {
    openFileDialog()
  }
}
</script>

<template>
  <Field
    ref="fileFieldEl"
    v-bind="fieldProps"
    :ui="mergedProps.ui"
    :model-value="model"
    :has-content="!!model?.length"
    class="file-input-simple"
    :class="{ 'dragged-over': isOverDropZone }"
    .focus="handleFocusOrClick"
    @focus="handleFocusOrClick"
    @click="handleFocusOrClick"
  >
    <FileInputSimpleInner
      ref="el"
      v-bind="$props"
      :ui="mergedProps.ui"
      :model-value="model"
      :file-remove-fnc="handleRemoveFile"
      :open-file-dialog
    />

    <template #append>
      <Btn
        icon="i-material-symbols:attachment"
        size="sm"
        m="r-2"
        @click.stop.prevent="openFileDialog"
      />
    </template>
  </Field>
</template>

<style lang="scss" scoped>
.file-input-simple {
  @apply min-w-50;
}
</style>

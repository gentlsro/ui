<script setup lang="ts">
// Functions
import { useFileInput } from './functions/useFileInput'
import { useFieldUtils } from '../../Field/functions/useFieldUtils'

// Constants
import { INPUT_WRAPPER_DEFAULT_PROPS } from '../../InputWrapper/constants/input-wrapper-default-props'

const props = withDefaults(defineProps<IFileInputProps>(), {
  ...getComponentProps('fileInputSimple'),
})

defineEmits<IFileInputEmits>()

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

// Styles - append
const appendClass = computed(() => {
  return mergedProps.value.ui?.appendClass?.({
    defaults: INPUT_WRAPPER_DEFAULT_PROPS.ui.appendClass(),
  })
})

// Styles - append
const appendStyle = computed(() => {
  return mergedProps.value.ui?.appendStyle?.()
})
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
      :no-download-button
    />

    <template #append>
      <div
        :class="appendClass"
        :style="appendStyle"
      >
        <Btn
          icon="i-material-symbols:attachment"
          size="sm"
          @click.stop.prevent="openFileDialog"
        />
      </div>
    </template>
  </Field>
</template>

<style lang="scss" scoped>
.file-input-simple {
  @apply min-w-50;
}
</style>

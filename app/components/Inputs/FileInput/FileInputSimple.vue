<script setup lang="ts" vapor>
import { mergeProps } from 'vue'

// Types
import type { IFileInputProps } from './types/file-input-props.type'
import type { IFileInputEmits } from './types/file-input-emits.type'

// Functions
import { useFileInput } from './functions/useFileInput'
import { useFieldUtils } from '../../Field/functions/useFieldUtils'

// Constants
import { INPUT_WRAPPER_DEFAULT_PROPS } from '../../InputWrapper/constants/input-wrapper-default-props'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<IFileInputProps>(), {
  ...getComponentProps('fileInputSimple'),
})

const emits = defineEmits<IFileInputEmits>()

// Utils
const { getFieldProps, handleFocusOrClick, handleBlur } = useFieldUtils({
  props,
  emit: event => emits(event),
  onFocus: handleOpenDialog,
  getElement: () => fileFieldEl.value?.controlElement,
})

// Layout
const model = defineModel<IFileInputProps['modelValue']>({ default: () => [] })

const {
  fileFieldEl,
  isOverDropZone,
  handleRemoveFile,
  openFileDialog,
} = useFileInput({ model, props, emit: emits })

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
    v-bind="mergeProps(fieldProps, $attrs)"
    :ui="mergedProps.ui"
    :model-value="model"
    :has-content="!!model?.length"
    class="file-input-simple"
    :class="{ 'dragged-over': isOverDropZone }"
    .focus="handleFocusOrClick"
    @focus="handleFocusOrClick"
    @blur="handleBlur"
    @click="handleFocusOrClick"
  >
    <FileInputSimpleInner
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
          :disabled="readonly || disabled"
          disable-style="flat"
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

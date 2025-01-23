<script setup lang="ts">
// Types
import type { IFile } from '$utils/shared/types/file.type'
import type { IFileInputProps } from './types/file-input-props.type'

const props = defineProps<IFileInputProps & {
  fileRemoveFnc: (idx: number) => void
  openFileDialog: () => void
}>()

// Layout
const model = toRef(props, 'modelValue')

const isEditable = computed(() => {
  return !props.readonly && !props.disabled
})

function handleClick() {
  if (!props.multi) {
    props.openFileDialog()
  }
}
</script>

<template>
  <div
    class="file-input__inner"
    :class="[ui?.innerClass, { 'is-editable': isEditable, 'is-multi': multi }]"
    :style="ui?.innerStyle"
    @click="handleClick"
  >
    <FilePreview
      v-for="(file, idx) in model"
      :key="idx"
      :file
      :editable="isEditable"
      :no-download-button
      :download-url
      :no-preview
      @remove="fileRemoveFnc(idx)"
      @click.stop.prevent
    />

    <slot name="add">
      <FileInputAdd
        v-if="multi && isEditable"
        :multi
        @click="openFileDialog"
      />
    </slot>
  </div>
</template>

<style lang="scss" scoped>
.file-input__inner {
  @apply grid min-h-50 border-2 border-dashed p-2 rounded-3 relative overflow-auto gap-2 cursor-default;
  @apply dark:border-true-gray-600/50 border-true-gray-300/80;
  @apply dark:bg-black bg-white;

  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));

  &.is-dragger-over,
  &:hover {
    @apply dark:border-true-gray-600 border-true-gray-300;

    .file-input-wrapper-hint {
      @apply color-darker dark:color-light-800;
    }
  }

  &.is-editable:not(.is-multi) {
    @apply cursor-pointer;
  }
}
</style>
